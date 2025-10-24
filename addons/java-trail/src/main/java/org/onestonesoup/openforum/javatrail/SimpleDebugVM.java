package org.onestonesoup.openforum.javatrail;

import java.io.IOException;
import java.util.*;
import java.util.function.Supplier;

import com.sun.jdi.*;
import com.sun.jdi.connect.AttachingConnector;
import com.sun.jdi.connect.Connector;
import com.sun.jdi.connect.IllegalConnectorArgumentsException;
import com.sun.jdi.event.*;
import com.sun.jdi.request.EventRequestManager;
import com.sun.jdi.request.EventRequest;
import com.sun.jdi.request.MethodEntryRequest;
import com.sun.jdi.request.MethodExitRequest;
import com.sun.jdi.request.ModificationWatchpointRequest;

public class SimpleDebugVM implements Runnable{

private VirtualMachine vm;
private Map< String, ReferenceType > referenceMap;
private EventQueue eventQueue;
private final Object fieldChangeLock = new Object();
private final List<FieldChange> pendingFieldChanges = new ArrayList<>();
private final Object methodTraceLock = new Object();
private final List<MethodTraceSession> methodTraceSessions = new ArrayList<>();
private boolean running = false;
private Thread workerThread;

public SimpleDebugVM(String host, String port) throws IllegalConnectorArgumentsException, IOException {
    connect( host, port );

    workerThread = new Thread(this, "SimpleDebugVM-EventLoop");
    workerThread.setDaemon(true);
    workerThread.start();
}

private void connect(String host, String port) throws IllegalConnectorArgumentsException, IOException {
    AttachingConnector connector = getConnector();

    Map<String, Connector.Argument> args = connector.defaultArguments();
    Connector.Argument portArg = args.get("port");
    portArg.setValue(port);
    Connector.Argument addressArg = args.get("hostname");
    addressArg.setValue(host);

    vm = connector.attach(args);

    List<ReferenceType> referenceTypes = vm.allClasses();
    referenceMap = new HashMap<String, ReferenceType>();

    for (ReferenceType referenceType : referenceTypes) {
        referenceMap.put( referenceType.name(), referenceType);
    }

    eventQueue = vm.eventQueue();
}

public VirtualMachine getVirtualMachine() {
    return vm;
}

public String[] getMatchingClasses( String matcher, int maxValues ) {
    List<String> found = new ArrayList<>();

    for(int mode=0;mode<3; mode++) {
        String adjustedMatcher = matcher;
        switch(mode) {
            case 1:
                adjustedMatcher = matcher + ".*"; // Starts with
                break;
            case 2:
                adjustedMatcher = ".*" + matcher; // Contains
                break;
        }
        //Case sensitive search
        for (String name : referenceMap.keySet()) {
            if ( name.matches(adjustedMatcher) ) {
                found.add(name);
                if (found.size() >= maxValues) {
                    return found.toArray(new String[found.size()]);
                }
            }
        }
        //Case insensitive search
        for (String name : referenceMap.keySet()) {
            if ( name.toLowerCase().matches(adjustedMatcher.toLowerCase()) ) {
                found.add(name);
                if (found.size() >= maxValues) {
                    return found.toArray(new String[found.size()]);
                }
            }
        }
    }

    return found.toArray( new String[found.size()] );
}

public String[] getFieldNames(String className) throws Exception {
    ReferenceType type = referenceMap.get(className);
    if(type == null) {
        throw new Exception( "class " + className + " not found" );
    }
    List<String> found = new ArrayList<>();
    for(Field field: type.allFields()) {
        found.add( field.name() );
    }
    return found.toArray( new String[found.size()] );
}

public ModificationWatchpointRequest watch( String className, String fieldName ) throws Exception {

    ReferenceType referenceType = referenceMap.get( className );
    if(referenceType == null) {
        throw new Exception( "class " + className + " not found" );
    }

    for (Field field : referenceType.allFields()) {
        if( field.name().equals(fieldName) ) {
            EventRequestManager erm = vm.eventRequestManager();
            ModificationWatchpointRequest modificationWatchpointRequest = erm.createModificationWatchpointRequest(field);
            modificationWatchpointRequest.setEnabled(true);
            return modificationWatchpointRequest;
        }
    }

    throw new Exception( "field name " + fieldName + " in class " + className + " not found" );
}

public MethodTraceSession startMethodTrace(MethodTraceConfig config) {
    MethodTraceSession session = new MethodTraceSession(config, vm.eventRequestManager());
    synchronized (methodTraceLock) {
        methodTraceSessions.removeIf(MethodTraceSession::isMarkedForRemoval);
        methodTraceSessions.add(session);
    }
    session.enableRequests();
    return session;
}

public void disconnect() {
    running = false;
    synchronized (methodTraceLock) {
        for(MethodTraceSession session : methodTraceSessions) {
            session.onVmDisconnected();
        }
        methodTraceSessions.clear();
    }
    if(vm != null) {
        try {
            vm.dispose();
        } catch (VMDisconnectedException ignored) {
        }
    }
    if(workerThread != null) {
        workerThread.interrupt();
    }
}

public class FieldChange {
    public String className;
    public String fieldName;
    public String currentValue;
    public String newValue;
    public String[] shortStack;
    FieldChange( String className, String fieldName, String currentValue, String newValue, String[] shortStack ) {
        this.className = className;
        this.fieldName = fieldName;
        this.currentValue = currentValue;
        this.newValue = newValue;
        this.shortStack = shortStack;
    }
}

    public FieldChange[] checkForChanges() {
        synchronized (fieldChangeLock) {
            if(pendingFieldChanges.isEmpty()) {
                return new FieldChange[0];
            }
            FieldChange[] result = pendingFieldChanges.toArray(new FieldChange[pendingFieldChanges.size()]);
            pendingFieldChanges.clear();
            return result;
        }
    }

    public void run() {
        running = true;

        while( running ) {
            try {
                EventSet eventSet = eventQueue.remove();
                for (Event event : eventSet) {
                    handleEvent(event);
                }
                eventSet.resume();
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                running = false;
            } catch (VMDisconnectedException e) {
                running = false;
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

    private void handleEvent(Event event) throws IncompatibleThreadStateException {
        if (event instanceof ModificationWatchpointEvent) {
            handleWatchpoint((ModificationWatchpointEvent) event);
        } else if (event instanceof MethodEntryEvent) {
            handleMethodEntry((MethodEntryEvent) event);
        } else if (event instanceof MethodExitEvent) {
            handleMethodExit((MethodExitEvent) event);
        } else if (event instanceof VMDisconnectEvent || event instanceof VMDeathEvent) {
            disconnect();
        }
    }

    private void handleWatchpoint(ModificationWatchpointEvent modificationWatchpointEvent) throws IncompatibleThreadStateException {
        String className = modificationWatchpointEvent.field().typeName();
        String fieldName = modificationWatchpointEvent.field().name();
        String currentValue = "" + modificationWatchpointEvent.valueCurrent();
        String newValue = "" + modificationWatchpointEvent.valueToBe();
        List<String> shortStack = new ArrayList<>();

        List<StackFrame> frames = modificationWatchpointEvent.thread().frames(0, 5);
        for (StackFrame stackFrame : frames) {
            String reference = stackFrame.location().declaringType().name() + "." + stackFrame.location().method().name() + "#" + stackFrame.location().lineNumber();
            shortStack.add( reference );
        }

        FieldChange change = new FieldChange(
                className,
                fieldName,
                currentValue,
                newValue,
                shortStack.toArray(new String[shortStack.size()])
        );
        synchronized (fieldChangeLock) {
            pendingFieldChanges.add(change);
        }
    }

    private void handleMethodEntry(MethodEntryEvent event) {
        synchronized (methodTraceLock) {
            Iterator<MethodTraceSession> iterator = methodTraceSessions.iterator();
            while(iterator.hasNext()) {
                MethodTraceSession session = iterator.next();
                if(session.isMarkedForRemoval()) {
                    iterator.remove();
                    continue;
                }
                session.onMethodEntry(event);
            }
        }
    }

    private void handleMethodExit(MethodExitEvent event) {
        synchronized (methodTraceLock) {
            Iterator<MethodTraceSession> iterator = methodTraceSessions.iterator();
            while(iterator.hasNext()) {
                MethodTraceSession session = iterator.next();
                if(session.isMarkedForRemoval()) {
                    iterator.remove();
                    continue;
                }
                session.onMethodExit(event);
            }
        }
    }

    private AttachingConnector getConnector() {
        VirtualMachineManager vmManager = Bootstrap.virtualMachineManager();

        for (Connector connector : vmManager.attachingConnectors()) {
            if("com.sun.jdi.SocketAttach".equals(connector.name()))
                return (AttachingConnector) connector;
        }
        throw new IllegalStateException();
    }

    public static class MethodTraceConfig {
        public final String startClass;
        public final String startMethod;
        public final String startSignature;
        public final List<String> includePackages;
        public final List<String> excludePackages;
        public final boolean skipOutsideDomain;
        public final int maxDepth;
        public final long maxDurationMillis;

        public MethodTraceConfig(String startClass,
                                 String startMethod,
                                 String startSignature,
                                 List<String> includePackages,
                                 List<String> excludePackages,
                                 boolean skipOutsideDomain,
                                 int maxDepth,
                                 long maxDurationMillis) {
            this.startClass = startClass;
            this.startMethod = startMethod;
            this.startSignature = startSignature;
            this.includePackages = includePackages != null ? new ArrayList<>(includePackages) : Collections.emptyList();
            this.excludePackages = excludePackages != null ? new ArrayList<>(excludePackages) : Collections.emptyList();
            this.skipOutsideDomain = skipOutsideDomain;
            this.maxDepth = maxDepth;
            this.maxDurationMillis = maxDurationMillis;
        }
    }

    public enum TraceEventType {
        ENTER,
        EXIT
    }

    public static class MethodTraceEvent {
        public final TraceEventType type;
        public final String className;
        public final String methodName;
        public final String signature;
        public final int lineNumber;
        public final int depth;
        public final String threadName;
        public final long timestampMillis;
        public final long elapsedMillis;
        public final long durationMillis;

        MethodTraceEvent(TraceEventType type,
                         String className,
                         String methodName,
                         String signature,
                         int lineNumber,
                         int depth,
                         String threadName,
                         long timestampMillis,
                         long elapsedMillis,
                         long durationMillis) {
            this.type = type;
            this.className = className;
            this.methodName = methodName;
            this.signature = signature;
            this.lineNumber = lineNumber;
            this.depth = depth;
            this.threadName = threadName;
            this.timestampMillis = timestampMillis;
            this.elapsedMillis = elapsedMillis;
            this.durationMillis = durationMillis;
        }
    }

    public static class MethodTraceSession {
        private final MethodTraceConfig config;
        private final EventRequestManager eventRequestManager;
        private final Supplier<Long> timeSource;
        private MethodEntryRequest entryRequest;
        private MethodExitRequest exitRequest;
        private final Deque<CallFrame> callStack = new ArrayDeque<>();
        private final List<MethodTraceEvent> events = new ArrayList<>();
        private final Object completionMonitor = new Object();
        private ThreadReference tracingThread;
        private boolean started = false;
        private boolean completed = false;
        private boolean timedOut = false;
        private boolean markedForRemoval = false;
        private boolean startEncountered = false;
        private final long creationTime;
        private long traceStartTime = -1;
        private long traceEndTime = -1;
        private String completionReason = "Awaiting start method";

        MethodTraceSession(MethodTraceConfig config,
                           EventRequestManager eventRequestManager) {
            this(config, eventRequestManager, System::currentTimeMillis);
        }

        MethodTraceSession(MethodTraceConfig config,
                           EventRequestManager eventRequestManager,
                           Supplier<Long> timeSource) {
            this.config = config;
            this.eventRequestManager = eventRequestManager;
            this.timeSource = timeSource != null ? timeSource : System::currentTimeMillis;
            this.creationTime = this.timeSource.get();
        }

        void enableRequests() {
            entryRequest = eventRequestManager.createMethodEntryRequest();
            exitRequest = eventRequestManager.createMethodExitRequest();
            entryRequest.setSuspendPolicy(EventRequest.SUSPEND_EVENT_THREAD);
            exitRequest.setSuspendPolicy(EventRequest.SUSPEND_EVENT_THREAD);

            entryRequest.setEnabled(true);
            exitRequest.setEnabled(true);
        }

        void onMethodEntry(MethodEntryEvent event) {
            if (completed) {
                return;
            }

            ThreadReference thread = event.thread();
            if (!started) {
                if (!matchesStart(event)) {
                    checkForTimeoutBeforeStart();
                    return;
                }
                started = true;
                startEncountered = true;
                tracingThread = thread;
                traceStartTime = timeSource.get();
                completionReason = "Tracing";
                callStack.clear();
            } else if (!thread.equals(tracingThread)) {
                return;
            }

            String className = event.method().declaringType().name();
            String methodName = event.method().name();
            String signature = event.method().signature();

            int depth = callStack.size();
            boolean isStartFrame = isStartFrameCandidate(className, methodName, signature);
            boolean loggable = shouldLog(className);
            if (config.maxDepth > 0 && depth >= config.maxDepth && !isStartFrame) {
                loggable = false;
            }

            CallFrame frame = new CallFrame(className,
                    methodName,
                    signature,
                    event.location() != null ? event.location().lineNumber() : -1,
                    loggable,
                    isStartFrame,
                    timeSource.get(),
                    depth);
            callStack.push(frame);

            if (frame.loggable) {
                addEvent(TraceEventType.ENTER, frame, frame.entryLine, 0L, thread.name());
            }

            enforceLimits();
        }

        void onMethodExit(MethodExitEvent event) {
            if (completed || !started) {
                return;
            }

            if (!event.thread().equals(tracingThread)) {
                return;
            }

            if(callStack.isEmpty()) {
                return;
            }

            Method method = event.method();
            CallFrame frame = callStack.peek();
            if (frame == null) {
                return;
            }
            if (!frame.matches(method)) {
                CallFrame match = null;
                for (CallFrame candidate : callStack) {
                    if (candidate.matches(method)) {
                        match = candidate;
                        break;
                    }
                }
                if (match == null) {
                    return;
                }
                while (!callStack.isEmpty()) {
                    CallFrame popped = callStack.pop();
                    if (popped == match) {
                        frame = popped;
                        break;
                    }
                }
            } else {
                callStack.pop();
            }

            long now = timeSource.get();
            if (frame.loggable) {
                int exitLine = event.location() != null ? event.location().lineNumber() : frame.entryLine;
                addEvent(TraceEventType.EXIT, frame, exitLine, now - frame.entryTimestamp, event.thread().name());
            }

            if (isStartFrame(frame) && callStack.isEmpty()) {
                complete("Returned to start method", false);
            } else {
                enforceLimits();
            }
        }

        private void addEvent(TraceEventType type, CallFrame frame, int lineNumber, long durationMillis, String threadName) {
            long timestamp = timeSource.get();
            long elapsed = traceStartTime > 0 ? timestamp - traceStartTime : 0L;
            MethodTraceEvent event = new MethodTraceEvent(
                    type,
                    frame.className,
                    frame.methodName,
                    frame.signature,
                    lineNumber,
                    frame.depth,
                    threadName,
                    timestamp,
                    elapsed,
                    durationMillis
            );
            events.add(event);
        }

        private void enforceLimits() {
            if (!started || completed) {
                return;
            }
            if (config.maxDurationMillis > 0 && traceStartTime >= 0) {
                long now = timeSource.get();
                if (now - traceStartTime >= config.maxDurationMillis) {
                    complete("Reached maxDurationMillis", true);
                    return;
                }
            }
            if (config.maxDepth > 0 && !callStack.isEmpty()) {
                CallFrame frame = callStack.peek();
                if (frame.depth >= config.maxDepth) {
                    complete("Reached maxDepth", false);
                    return;
                }
            }
        }

        private void checkForTimeoutBeforeStart() {
            if (completed || config.maxDurationMillis <= 0) {
                return;
            }
            long now = timeSource.get();
            if (now - creationTime >= config.maxDurationMillis) {
                complete("Start method not reached within maxDurationMillis", true);
            }
        }

        private boolean matchesStart(MethodEntryEvent event) {
            String className = event.method().declaringType().name();
            if (!config.startClass.equals(className)) {
                return false;
            }
            if (!config.startMethod.equals(event.method().name())) {
                return false;
            }
            if (config.startSignature != null && !config.startSignature.isEmpty()) {
                return config.startSignature.equals(event.method().signature());
            }
            return true;
        }

        private boolean shouldLog(String className) {
            if (config.startClass.equals(className)) {
                return true;
            }
            if (!config.excludePackages.isEmpty()) {
                for (String exclude : config.excludePackages) {
                    if (className.startsWith(exclude)) {
                        return false;
                    }
                }
            }
            boolean includeMatch = config.includePackages.isEmpty();
            if (!includeMatch) {
                for (String include : config.includePackages) {
                    if (className.startsWith(include)) {
                        includeMatch = true;
                        break;
                    }
                }
            }
            if (config.skipOutsideDomain && !includeMatch) {
                return false;
            }
            return includeMatch;
        }

        private boolean isStartFrame(CallFrame frame) {
            return isStartFrameCandidate(frame.className, frame.methodName, frame.signature);
        }

        public boolean awaitCompletion(long maxWaitMillis) throws InterruptedException {
            synchronized (completionMonitor) {
                if (completed) {
                    return true;
                }
                if (maxWaitMillis <= 0) {
                    while (!completed) {
                        completionMonitor.wait();
                    }
                    return true;
                }
                long deadline = System.currentTimeMillis() + maxWaitMillis;
                while (!completed) {
                    long remaining = deadline - System.currentTimeMillis();
                    if (remaining <= 0) {
                        complete("Await completion timeout", true);
                        break;
                    }
                    completionMonitor.wait(remaining);
                }
                return completed;
            }
        }

        public List<MethodTraceEvent> getEvents() {
            return new ArrayList<>(events);
        }

        public boolean isCompleted() {
            return completed;
        }

        public boolean hasStarted() {
            return startEncountered;
        }

        public long getTraceStartTime() {
            return traceStartTime;
        }

        public long getTraceEndTime() {
            return traceEndTime;
        }

        public String getCompletionReason() {
            return completionReason;
        }

        public boolean isTimedOut() {
            return timedOut;
        }

        public void requestStop(String reason) {
            complete(reason != null ? reason : "Stopped by user", false);
        }

        void onVmDisconnected() {
            complete("VM disconnected", false);
        }

        private void complete(String reason, boolean timedOut) {
            synchronized (completionMonitor) {
                if (completed) {
                    return;
                }
                this.completed = true;
                this.timedOut = timedOut;
                this.completionReason = reason;
                this.traceEndTime = timeSource.get();
                disableRequests();
                markedForRemoval = true;
                completionMonitor.notifyAll();
            }
        }

        private void disableRequests() {
            try {
                if (entryRequest != null) {
                    eventRequestManager.deleteEventRequest(entryRequest);
                }
            } catch (Exception ignored) {
            }
            try {
                if (exitRequest != null) {
                    eventRequestManager.deleteEventRequest(exitRequest);
                }
            } catch (Exception ignored) {
            }
        }

        boolean isMarkedForRemoval() {
            return markedForRemoval;
        }

        private boolean isStartFrameCandidate(String className, String methodName, String signature) {
            return config.startClass.equals(className)
                    && config.startMethod.equals(methodName)
                    && (config.startSignature == null || config.startSignature.isEmpty() || config.startSignature.equals(signature));
        }

        private class CallFrame {
            private final String className;
            private final String methodName;
            private final String signature;
            private final int entryLine;
            private final int depth;
            private boolean loggable;
            private final long entryTimestamp;

            private CallFrame(String className,
                              String methodName,
                              String signature,
                              int entryLine,
                              boolean loggable,
                              boolean startFrame,
                              long entryTimestamp,
                              int depth) {
                this.className = className;
                this.methodName = methodName;
                this.signature = signature;
                this.entryLine = entryLine;
                this.loggable = loggable || startFrame;
                this.entryTimestamp = entryTimestamp;
                this.depth = depth;
            }

            private boolean matches(Method method) {
                return method != null
                        && className.equals(method.declaringType().name())
                        && methodName.equals(method.name())
                        && signature.equals(method.signature());
            }
        }
    }
}
