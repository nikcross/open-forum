package org.onestonesoup.openforum.javatrail;

import java.io.IOException;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;

import com.sun.jdi.connect.IllegalConnectorArgumentsException;

import org.onestonesoup.core.data.EntityTree;
import org.onestonesoup.core.data.JsonHelper;
import org.onestonesoup.openforum.messagequeue.MessageQueue;
import org.onestonesoup.openforum.messagequeue.MessageQueueManager;
import org.onestonesoup.openforum.plugin.SystemAPI;

public class JavaTrailSystemHelper extends SystemAPI {
    private static final String OWNER = "JavaTrailSystemHelper";
    private static final String JAVA_TRAIL_QUEUE = "/Test/JavaTrail";
    private static final String JAVA_TRAIL_CAM_QUEUE = "/Test/JavaTrailCam";
    private static final ConcurrentMap<String, JavaTrailCamSession> CAM_SESSIONS = new ConcurrentHashMap<>();
    private static final ConcurrentMap<String, SessionStatus> CAM_STATUSES = new ConcurrentHashMap<>();

    public SimpleDebugVM connectJavaTrail(String host, String port) throws IllegalConnectorArgumentsException, IOException {
        MessageQueue queue = getQueue(JAVA_TRAIL_QUEUE);
        post(queue, "Connecting to JavaTrail at " + host + ":" + port);

        JavaTrail javaTrail = new JavaTrail();
        SimpleDebugVM vm = javaTrail.connect(host, port);

        post(queue, "JavaTrail connected to " + host + ":" + port);
        return vm;
    }

    public String runJavaTrailCam(String configJson) {
        MessageQueue queue = getQueue(JAVA_TRAIL_CAM_QUEUE);
        String sessionId = UUID.randomUUID().toString();
        JavaTrailCam.Config config = null;
        try {
            config = JavaTrailCam.Config.fromString(configJson);
        } catch (Exception e) {
            post(queue, sessionId, "Failed to parse config: " + e.getMessage());
        }

        if (config != null) {
            post(queue, sessionId, "Starting JavaTrailCam session for " + config.getStartClass() + "#" + config.getStartMethod());
            if (!config.getIncludePackages().isEmpty()) {
                post(queue, sessionId, "Include packages: " + String.join(", ", config.getIncludePackages()));
            }
            if (!config.getExcludePackages().isEmpty()) {
                post(queue, sessionId, "Exclude packages: " + String.join(", ", config.getExcludePackages()));
            }
        } else {
            post(queue, sessionId, "Starting JavaTrailCam session");
        }

        JavaTrailCam cam = createJavaTrailCam();
        JavaTrailCamSession session = new JavaTrailCamSession(sessionId, cam);
        session.updateState(SessionState.STARTING, "Session created", false);
        CAM_SESSIONS.put(sessionId, session);
        Thread thread = new Thread(() -> {
            try {
                session.updateState(SessionState.RUNNING, "JavaTrailCam processing started", false);
                String json = cam.processUsingConfig(configJson);

                if (json == null || json.isEmpty()) {
                    post(queue, sessionId, "JavaTrailCam returned no data");
                    session.updateState(SessionState.NO_DATA, "JavaTrailCam returned no data", false);
                } else if (json.startsWith("Exception")) {
                    post(queue, sessionId, "JavaTrailCam reported exception payload");
                    session.updateState(SessionState.FAILED, json, false);
                    publishTrace(sessionId, queue, json);
                } else {
                    EntityTree.TreeEntity root = null;
                    boolean timedOut = false;
                    try {
                        root = JsonHelper.parseObject("javaTrailCamTrace", json.trim()).getRoot();
                        timedOut = Boolean.parseBoolean(valueOf(root, "timedOut"));
                    } catch (Exception parseEx) {
                        post(queue, sessionId, "Failed to parse trace JSON for status: " + parseEx.getMessage());
                    }
                    if (timedOut) {
                        session.updateState(SessionState.TIMED_OUT, "Trace completed with timeout", true);
                    } else {
                        session.updateState(SessionState.COMPLETED, "Trace completed successfully", false);
                    }
                    post(queue, sessionId, "JavaTrailCam session finished");
                    publishTrace(sessionId, queue, json, root);
                }
            } catch (Exception e) {
                post(queue, sessionId, "JavaTrailCam execution failed: " + e.getMessage());
                session.updateState(SessionState.FAILED, "JavaTrailCam execution failed: " + e.getMessage(), false);
            } finally {
                session.signalCompletion();
                CAM_SESSIONS.remove(sessionId, session);
            }
        });
        thread.setName("JavaTrailCam-" + sessionId);
        session.setThread(thread);
        thread.start();
        post(queue, sessionId, "Background JavaTrailCam thread started");
        return sessionId;
    }

    public String stopJavaTrailCam(String sessionId) {
        MessageQueue queue = getQueue(JAVA_TRAIL_CAM_QUEUE);
        JavaTrailCamSession session = CAM_SESSIONS.get(sessionId);
        if (session == null) {
            post(queue, sessionId, "No active JavaTrailCam session found");
            return "Session not found";
        }

        post(queue, sessionId, "Stopping JavaTrailCam session");
        session.requestStop("Stopped via stopJavaTrailCam");
        boolean terminated = false;
        try {
            if (session.awaitTermination(5000L)) {
                post(queue, sessionId, "JavaTrailCam session thread terminated");
                terminated = true;
            } else {
                post(queue, sessionId, "JavaTrailCam session thread still running after timeout");
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            post(queue, sessionId, "Interrupted while waiting for session termination");
        } finally {
            if (terminated) {
                session.updateState(SessionState.STOPPED, "Stopped via stopJavaTrailCam", session.isTimedOut());
                CAM_SESSIONS.remove(sessionId, session);
            }
        }

        return sessionId;
    }

    public String getJavaTrailCamStatus(String sessionId) {
        SessionStatus status = CAM_STATUSES.get(sessionId);
        if (status == null) {
            return "Session " + sessionId + " not found";
        }

        StringBuilder builder = new StringBuilder();
        builder.append("Session ").append(sessionId).append(": ").append(status.state.name());
        if (status.timedOut) {
            builder.append(" (timed out)");
        }
        builder.append(status.active ? " [running]" : " [cleaned up]");
        if (status.message != null && !status.message.isEmpty()) {
            builder.append(" - ").append(status.message);
        }
        return builder.toString();
    }

    private void publishTrace(String sessionId, MessageQueue queue, String json) {
        publishTrace(sessionId, queue, json, null);
    }

    private void publishTrace(String sessionId, MessageQueue queue, String json, EntityTree.TreeEntity preParsedRoot) {
        if (json.startsWith("Exception")) {
            post(queue, sessionId, json);
            return;
        }

        try {
            EntityTree.TreeEntity root = preParsedRoot != null
                    ? preParsedRoot
                    : JsonHelper.parseObject("javaTrailCamTrace", json.trim()).getRoot();

            post(queue, sessionId, "Trace JSON: " + json);
            post(queue, sessionId, "Trace completion reason: " + valueOf(root, "completionReason"));
            post(queue, sessionId, "Trace timed out: " + valueOf(root, "timedOut"));
            post(queue, sessionId, "Trace events: " + valueOf(root, "eventCount"));

            EntityTree.TreeEntity eventsNode = root.getChild("events");
            if (eventsNode != null) {
                for (EntityTree.TreeEntity event : eventsNode.getChildren()) {
                    String type = valueOf(event, "type");
                    String className = valueOf(event, "className");
                    String methodName = valueOf(event, "methodName");
                    String line = valueOf(event, "lineNumber");
                    post(queue, sessionId, "Event " + type + " - " + className + "." + methodName + " @ line " + line);
                }
            }
        } catch (Exception e) {
            post(queue, sessionId, "Failed to parse trace JSON: " + e.getMessage());
        }
    }

    private String valueOf(EntityTree.TreeEntity entity, String childName) {
        EntityTree.TreeEntity child = entity.getChild(childName);
        return child != null && child.getValue() != null ? child.getValue() : "";
    }

    MessageQueue getQueue(String queueId) {
        MessageQueueManager queueManager = getController().getQueueManager();
        return queueManager.getQueue(queueId);
    }

    private void post(MessageQueue queue, String sessionId, String message) {
        post(queue, "[" + sessionId + "] " + message);
    }

    private void post(MessageQueue queue, String message) {
        if (queue != null) {
            queue.postMessage(message, OWNER);
        }
    }

    JavaTrailCam createJavaTrailCam() {
        return new JavaTrailCam();
    }

    static void clearSessionsForTest() {
        CAM_SESSIONS.clear();
        CAM_STATUSES.clear();
    }

    private static final class JavaTrailCamSession {
        private final String id;
        private final JavaTrailCam cam;
        private final CountDownLatch completionLatch = new CountDownLatch(1);
        private final AtomicBoolean stopRequested = new AtomicBoolean(false);
        private volatile Thread thread;
        private volatile SessionState state = SessionState.STARTING;
        private volatile String statusMessage = "Session created";
        private volatile boolean timedOut;

        private JavaTrailCamSession(String id, JavaTrailCam cam) {
            this.id = id;
            this.cam = cam;
            refreshStatus();
        }

        void setThread(Thread thread) {
            this.thread = thread;
            refreshStatus();
        }

        void requestStop(String reason) {
            if (stopRequested.compareAndSet(false, true)) {
                updateState(SessionState.STOP_REQUESTED, reason != null ? reason : "Stop requested", timedOut);
                Thread localThread = thread;
                boolean threadAlive = localThread != null && localThread.isAlive();

                SimpleDebugVM.MethodTraceSession traceSession = cam.getActiveTraceSession();
                if (traceSession == null && threadAlive) {
                    traceSession = waitForTraceSession(2000L);
                }
                if (traceSession != null) {
                    traceSession.requestStop(reason);
                }
                SimpleDebugVM vm = cam.getActiveVm();
                if (vm == null && threadAlive) {
                    vm = waitForVm(2000L);
                }
                if (vm != null) {
                    vm.disconnect();
                }
                if (localThread != null) {
                    localThread.interrupt();
                }
            }
        }

        boolean awaitTermination(long waitMillis) throws InterruptedException {
            Thread localThread = thread;
            if (localThread == null) {
                return true;
            }
            if (waitMillis <= 0) {
                completionLatch.await();
                return true;
            }
            boolean completed = completionLatch.await(waitMillis, TimeUnit.MILLISECONDS);
            if (!completed && localThread.isAlive()) {
                localThread.join(Math.max(1L, waitMillis / 2));
                completed = !localThread.isAlive();
            }
            return completed;
        }

        void signalCompletion() {
            completionLatch.countDown();
            refreshStatus();
        }

        private SimpleDebugVM.MethodTraceSession waitForTraceSession(long timeoutMillis) {
            long deadline = System.currentTimeMillis() + timeoutMillis;
            SimpleDebugVM.MethodTraceSession traceSession = cam.getActiveTraceSession();
            while (traceSession == null && System.currentTimeMillis() < deadline) {
                try {
                    Thread.sleep(25L);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                }
                traceSession = cam.getActiveTraceSession();
            }
            return traceSession;
        }

        private SimpleDebugVM waitForVm(long timeoutMillis) {
            long deadline = System.currentTimeMillis() + timeoutMillis;
            SimpleDebugVM vm = cam.getActiveVm();
            while (vm == null && System.currentTimeMillis() < deadline) {
                try {
                    Thread.sleep(25L);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                }
                vm = cam.getActiveVm();
            }
            return vm;
        }

        void updateState(SessionState newState, String message, boolean timedOutFlag) {
            if (newState != null) {
                this.state = newState;
            }
            if (message != null && !message.isEmpty()) {
                this.statusMessage = message;
            } else if (message != null) {
                this.statusMessage = "";
            }
            this.timedOut = timedOutFlag;
            refreshStatus();
        }

        SessionState getState() {
            return state;
        }

        String getStatusMessage() {
            return statusMessage;
        }

        boolean isTimedOut() {
            return timedOut;
        }

        private void refreshStatus() {
            boolean active = completionLatch.getCount() > 0;
            CAM_STATUSES.put(id, new SessionStatus(state, statusMessage, timedOut, active, System.currentTimeMillis()));
        }
    }

    private enum SessionState {
        STARTING,
        RUNNING,
        STOP_REQUESTED,
        COMPLETED,
        TIMED_OUT,
        FAILED,
        NO_DATA,
        STOPPED
    }

    private static final class SessionStatus {
        private final SessionState state;
        private final String message;
        private final boolean timedOut;
        private final boolean active;
        private final long updatedAt;

        private SessionStatus(SessionState state, String message, boolean timedOut, boolean active, long updatedAt) {
            this.state = state;
            this.message = message;
            this.timedOut = timedOut;
            this.active = active;
            this.updatedAt = updatedAt;
        }
    }
}
