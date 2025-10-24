package org.onestonesoup.openforum.javatrail;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.fail;

import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.function.Predicate;
import java.util.function.Supplier;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.onestonesoup.openforum.messagequeue.MessageQueue;

class JavaTrailSystemHelperTest {

    private static final String CAM_QUEUE_ID = "/Test/JavaTrailCam";
    private static final String BASIC_CONFIG = "{"
            + "\"host\":\"localhost\","
            + "\"port\":\"5005\","
            + "\"startClass\":\"com.example.App\","
            + "\"startMethod\":\"run\""
            + "}";

    private RecordingMessageQueue queue;
    private TestableHelper helper;

    @BeforeEach
    void setUp() {
        JavaTrailSystemHelper.clearSessionsForTest();
        queue = new RecordingMessageQueue();
    }

    @AfterEach
    void tearDown() {
        JavaTrailSystemHelper.clearSessionsForTest();
    }

    @Test
    @DisplayName("returns completed status when the JavaTrailCam session finishes successfully")
    void testRunJavaTrailCamCompletesSession() throws Exception {
        //Given
        //A helper configured with a completing camera and capture queue.
        CompletingJavaTrailCam cam = new CompletingJavaTrailCam(buildTraceJson(false));
        helper = new TestableHelper(() -> cam);
        helper.registerQueue(CAM_QUEUE_ID, queue);

        //When
        //The helper starts a JavaTrailCam session using the supplied configuration.
        String sessionId = helper.runJavaTrailCam(BASIC_CONFIG);
        cam.awaitStarted();

        //Then
        //The session status reports completion with a success message.
        String status = awaitStatus(helper, sessionId, s -> s.contains("COMPLETED"));
        assertTrue(status.contains("Trace completed successfully"), () -> "Unexpected status: " + status);
    }

    @Test
    @DisplayName("returns stopped status when a running session is stopped")
    void testStopJavaTrailCamUpdatesStatusAndEndsThread() throws Exception {
        //Given
        //A running JavaTrailCam session backed by a blocking camera.
        BlockingJavaTrailCam cam = new BlockingJavaTrailCam();
        helper = new TestableHelper(() -> cam);
        helper.registerQueue(CAM_QUEUE_ID, queue);

        String sessionId = helper.runJavaTrailCam(BASIC_CONFIG);
        cam.awaitStarted();

        awaitStatus(helper, sessionId, s -> s.contains("RUNNING"));

        //When
        //The session is requested to stop via the helper API.
        String result = helper.stopJavaTrailCam(sessionId);
        assertEquals(sessionId, result);

        //Then
        //The session reports a stopped status and the worker thread terminates.
        String finalStatus = awaitStatus(helper, sessionId, s -> s.contains("STOPPED"));
        assertTrue(finalStatus.contains("Stopped via stopJavaTrailCam"), () -> "Unexpected status: " + finalStatus);

        assertTrue(cam.awaitFinished(), "Expected background thread to finish");
        assertTrue(cam.wasInterrupted(), "Expected worker thread to be interrupted");
    }

    @Test
    @DisplayName("returns not found for unknown session id")
    void testGetJavaTrailCamStatusWithUnknownSession() {
        //Given
        //A helper with no active or recorded sessions.
        helper = new TestableHelper(CompletingJavaTrailCam::newDefault);

        //When
        //The status is requested for a missing session id.
        String status = helper.getJavaTrailCamStatus("missing");

        //Then
        //The helper reports that the session cannot be found.
        assertEquals("Session missing not found", status);
    }

    private static String awaitStatus(TestableHelper helper,
                                      String sessionId,
                                      Predicate<String> predicate) throws InterruptedException {
        long deadline = System.nanoTime() + Duration.ofSeconds(5).toNanos();
        String status = null;
        while (System.nanoTime() < deadline) {
            status = helper.getJavaTrailCamStatus(sessionId);
            if (predicate.test(status)) {
                return status;
            }
            Thread.sleep(50L);
        }
        fail("Condition not met for session " + sessionId + ". Last status: " + status);
        return status;
    }

    private static String buildTraceJson(boolean timedOut) {
        return "{"
                + "\"host\":\"localhost\","
                + "\"port\":\"5005\","
                + "\"startClass\":\"com.example.App\","
                + "\"startMethod\":\"run\","
                + "\"completionReason\":\"" + (timedOut ? "timeout" : "Returned to start method") + "\","
                + "\"timedOut\":\"" + timedOut + "\","
                + "\"eventCount\":\"1\","
                + "\"events\":[{"
                + "\"type\":\"ENTER\","
                + "\"className\":\"com.example.App\","
                + "\"methodName\":\"run\","
                + "\"lineNumber\":\"1\","
                + "\"depth\":\"0\","
                + "\"timestampMillis\":\"0\","
                + "\"elapsedMillis\":\"0\","
                + "\"durationMillis\":\"0\""
                + "}]"
                + "}";
    }

    private static final class CompletingJavaTrailCam extends JavaTrailCam {
        private final String response;
        private final CountDownLatch started = new CountDownLatch(1);

        CompletingJavaTrailCam() {
            this(buildTraceJson(false));
        }

        CompletingJavaTrailCam(String response) {
            this.response = response;
        }

        static CompletingJavaTrailCam newDefault() {
            return new CompletingJavaTrailCam();
        }

        @Override
        public String processUsingConfig(String configString) {
            started.countDown();
            return response;
        }

        void awaitStarted() throws InterruptedException {
            started.await(5, TimeUnit.SECONDS);
        }
    }

    private static final class BlockingJavaTrailCam extends JavaTrailCam {
        private final CountDownLatch started = new CountDownLatch(1);
        private final CountDownLatch finished = new CountDownLatch(1);
        private final AtomicBoolean interrupted = new AtomicBoolean(false);

        @Override
        public String processUsingConfig(String configString) {
            started.countDown();
            try {
                while (!Thread.currentThread().isInterrupted()) {
                    Thread.sleep(25L);
                }
            } catch (InterruptedException e) {
                interrupted.set(true);
                Thread.currentThread().interrupt();
            } finally {
                finished.countDown();
            }
            return "";
        }

        void awaitStarted() throws InterruptedException {
            started.await(5, TimeUnit.SECONDS);
        }

        boolean awaitFinished() throws InterruptedException {
            return finished.await(5, TimeUnit.SECONDS);
        }

        boolean wasInterrupted() {
            return interrupted.get();
        }
    }

    private static final class RecordingMessageQueue extends MessageQueue {
        private final List<String> messages = new CopyOnWriteArrayList<>();

        @Override
        public void postMessage(String message, String owner) {
            messages.add(owner + ":" + message);
        }

        List<String> messages() {
            return messages;
        }
    }

    private static final class TestableHelper extends JavaTrailSystemHelper {
        private final Map<String, MessageQueue> queues = new ConcurrentHashMap<>();
        private Supplier<? extends JavaTrailCam> camSupplier;

        private TestableHelper(Supplier<? extends JavaTrailCam> camSupplier) {
            this.camSupplier = camSupplier;
        }

        void registerQueue(String id, MessageQueue queue) {
            queues.put(id, queue);
        }

        @Override
        MessageQueue getQueue(String queueId) {
            return queues.computeIfAbsent(queueId, key -> new RecordingMessageQueue());
        }

        @Override
        JavaTrailCam createJavaTrailCam() {
            return camSupplier.get();
        }
    }
}
