package org.onestonesoup.openforum.javatrail;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verify;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayDeque;
import java.util.Arrays;
import java.util.Collections;
import java.util.Deque;
import java.util.List;
import java.util.function.Supplier;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.onestonesoup.core.data.EntityTree;
import org.onestonesoup.core.data.JsonHelper;

import com.sun.jdi.Location;
import com.sun.jdi.Method;
import com.sun.jdi.ReferenceType;
import com.sun.jdi.ThreadReference;
import com.sun.jdi.event.MethodEntryEvent;
import com.sun.jdi.event.MethodExitEvent;
import com.sun.jdi.request.EventRequestManager;
import com.sun.jdi.request.MethodEntryRequest;
import com.sun.jdi.request.MethodExitRequest;

class SimpleDebugVMMethodTraceSessionTest {

    @Test
    @DisplayName("Captures start method entry and exit")
    void testCapturesStartMethodEntryAndExit() throws IOException {
        //Given
        //A trace session configured for a specific start method with deterministic time progression
        TestTimeSource timeSource = new TestTimeSource(0L, 10L, 20L, 30L, 40L, 50L, 60L);
        SimpleDebugVM.MethodTraceConfig config = new SimpleDebugVM.MethodTraceConfig(
                "com.example.Root", "execute", null,
                Collections.emptyList(), Collections.emptyList(), false,
                -1, 0L);
        MethodEntryRequest entryRequest = mock(MethodEntryRequest.class);
        MethodExitRequest exitRequest = mock(MethodExitRequest.class);
        EventRequestManager erm = mock(EventRequestManager.class);
        when(erm.createMethodEntryRequest()).thenReturn(entryRequest);
        when(erm.createMethodExitRequest()).thenReturn(exitRequest);

        SimpleDebugVM.MethodTraceSession session = new SimpleDebugVM.MethodTraceSession(config, erm, timeSource);
        session.enableRequests();

        ThreadReference thread = mock(ThreadReference.class);
        when(thread.name()).thenReturn("main");
        MethodEntryEvent startEntry = methodEntryEvent(
                "com.example.Root", "execute", null, 42, thread);
        MethodExitEvent startExit = methodExitEvent(
                "com.example.Root", "execute", null, 45, thread);

        //When
        //The start method is entered and exited on the same thread
        session.onMethodEntry(startEntry);
        session.onMethodExit(startExit);

        //Then
        //The trace records matching ENTER and EXIT events and marks completion
        List<SimpleDebugVM.MethodTraceEvent> events = session.getEvents();
        assertEquals(2, events.size());
        assertEquals(SimpleDebugVM.TraceEventType.ENTER, events.get(0).type);
        assertEquals(SimpleDebugVM.TraceEventType.EXIT, events.get(1).type);
        assertTrue(session.isCompleted());
        assertTrue(session.hasStarted());
        assertEquals("Returned to start method", session.getCompletionReason());
        assertFalse(session.isTimedOut());

        // Save trace output
        saveTraceOutput("01-start-method-entry-exit.txt", session);
    }

    @Test
    @DisplayName("Maintains stack and filters logging outside include domain")
    void testMaintainsStackAndFiltersLoggingOutsideIncludeDomain() throws IOException {
        //Given
        //A trace session that skips logging for classes outside the include list
        TestTimeSource timeSource = new TestTimeSource(0L, 10L, 20L, 30L, 40L, 50L, 60L, 70L, 80L, 90L, 100L, 110L, 120L, 130L);
        SimpleDebugVM.MethodTraceConfig config = new SimpleDebugVM.MethodTraceConfig(
                "com.example.Root", "execute", null,
                Collections.singletonList("com.example"), Collections.singletonList("com.example.filtered"), true,
                -1, 0L);
        MethodEntryRequest entryRequest = mock(MethodEntryRequest.class);
        MethodExitRequest exitRequest = mock(MethodExitRequest.class);
        EventRequestManager erm = mock(EventRequestManager.class);
        when(erm.createMethodEntryRequest()).thenReturn(entryRequest);
        when(erm.createMethodExitRequest()).thenReturn(exitRequest);

        SimpleDebugVM.MethodTraceSession session = new SimpleDebugVM.MethodTraceSession(config, erm, timeSource);
        session.enableRequests();

        ThreadReference thread = mock(ThreadReference.class);
        when(thread.name()).thenReturn("main");
        MethodEntryEvent startEntry = methodEntryEvent(
                "com.example.Root", "execute", null, 10, thread);
        MethodEntryEvent outsideEntry = methodEntryEvent(
                "java.util.ArrayList", "add", "(Ljava/lang/Object;)Z", 20, thread);
        MethodEntryEvent includedEntry = methodEntryEvent(
                "com.example.Service", "process", "()V", 30, thread);
        MethodEntryEvent excludedEntry = methodEntryEvent(
                "com.example.filtered.Hidden", "invoke", "()V", 35, thread);

        MethodExitEvent excludedExit = methodExitEvent(
                "com.example.filtered.Hidden", "invoke", "()V", 36, thread);
        MethodExitEvent includedExit = methodExitEvent(
                "com.example.Service", "process", "()V", 31, thread);
        MethodExitEvent outsideExit = methodExitEvent(
                "java.util.ArrayList", "add", "(Ljava/lang/Object;)Z", 21, thread);
        MethodExitEvent startExit = methodExitEvent(
                "com.example.Root", "execute", null, 11, thread);

        //When
        //Start method enters a chain including filtered and excluded classes before returning
        session.onMethodEntry(startEntry);
        session.onMethodEntry(outsideEntry);
        session.onMethodEntry(includedEntry);
        session.onMethodExit(includedExit);
        session.onMethodEntry(excludedEntry);
        session.onMethodExit(excludedExit);
        session.onMethodExit(outsideExit);
        session.onMethodExit(startExit);

        //Then
        //Only domain-relevant methods should appear in the event list while completion succeeds
        List<SimpleDebugVM.MethodTraceEvent> events = session.getEvents();
        assertEquals(4, events.size());
        assertEquals("com.example.Root", events.get(0).className);
        assertEquals("com.example.Service", events.get(1).className);
        assertEquals(SimpleDebugVM.TraceEventType.EXIT, events.get(3).type);
        assertTrue(session.isCompleted());
        assertFalse(session.isTimedOut());

        // Save trace output
        saveTraceOutput("02-stack-filtering.txt", session);
    }

    @Test
    @DisplayName("Stops tracing when max duration is exceeded")
    void testStopsTracingWhenMaxDurationExceeded() throws IOException {
        //Given
        //A trace session with a max duration limit and deterministic time source
        TestTimeSource timeSource = new TestTimeSource(
                0L, 0L, 0L, 0L, 0L, 0L, 0L, 25L, 25L, 25L, 25L, 30L);
        SimpleDebugVM.MethodTraceConfig config = new SimpleDebugVM.MethodTraceConfig(
                "com.example.Root", "execute", null,
                Collections.emptyList(), Collections.emptyList(), false,
                -1, 20L);
        MethodEntryRequest entryRequest = mock(MethodEntryRequest.class);
        MethodExitRequest exitRequest = mock(MethodExitRequest.class);
        EventRequestManager erm = mock(EventRequestManager.class);
        when(erm.createMethodEntryRequest()).thenReturn(entryRequest);
        when(erm.createMethodExitRequest()).thenReturn(exitRequest);

        SimpleDebugVM.MethodTraceSession session = new SimpleDebugVM.MethodTraceSession(config, erm, timeSource);
        session.enableRequests();

        ThreadReference thread = mock(ThreadReference.class);
        when(thread.name()).thenReturn("main");
        MethodEntryEvent startEntry = methodEntryEvent("com.example.Root", "execute", null, 5, thread);
        MethodEntryEvent childEntry = methodEntryEvent("com.example.Service", "work", "()V", 6, thread);

        //When
        //The start method is entered and time limit is enforced
        session.onMethodEntry(startEntry);
        session.onMethodEntry(childEntry);

        //Then
        //Trace should end with a max duration message and timeout flag
        assertTrue(session.isCompleted());
        assertTrue(session.isTimedOut());
        assertEquals("Reached maxDurationMillis", session.getCompletionReason());

        // Save trace output
        saveTraceOutput("03-max-duration-exceeded.txt", session);
    }

    @Test
    @DisplayName("Stops tracing when max depth is exceeded")
    void testStopsTracingWhenMaxDepthExceeded() throws IOException {
        //Given
        //A trace session with max depth 1 allowing only the start frame
        TestTimeSource timeSource = new TestTimeSource(0L, 0L, 0L, 0L, 0L, 0L, 0L, 0L);
        SimpleDebugVM.MethodTraceConfig config = new SimpleDebugVM.MethodTraceConfig(
                "com.example.Root", "execute", null,
                Collections.singletonList("com.example"), Collections.emptyList(), true,
                1, 0L);
        MethodEntryRequest entryRequest = mock(MethodEntryRequest.class);
        MethodExitRequest exitRequest = mock(MethodExitRequest.class);
        EventRequestManager erm = mock(EventRequestManager.class);
        when(erm.createMethodEntryRequest()).thenReturn(entryRequest);
        when(erm.createMethodExitRequest()).thenReturn(exitRequest);

        SimpleDebugVM.MethodTraceSession session = new SimpleDebugVM.MethodTraceSession(config, erm, timeSource);
        session.enableRequests();

        ThreadReference thread = mock(ThreadReference.class);
        when(thread.name()).thenReturn("main");
        MethodEntryEvent startEntry = methodEntryEvent("com.example.Root", "execute", null, 5, thread);
        MethodEntryEvent childEntry = methodEntryEvent("com.example.Service", "process", "()V", 6, thread);

        //When
        //The start method enters a child frame exceeding the allowed depth
        session.onMethodEntry(startEntry);
        session.onMethodEntry(childEntry);

        //Then
        //Trace should complete with a max depth message without timing out
        assertTrue(session.isCompleted());
        assertFalse(session.isTimedOut());
        assertEquals("Reached maxDepth", session.getCompletionReason());

        // Save trace output
        saveTraceOutput("04-max-depth-exceeded.txt", session);
    }

    private static MethodEntryEvent methodEntryEvent(String className,
                                                     String methodName,
                                                     String signature,
                                                     int lineNumber,
                                                     ThreadReference thread) {
        MethodEntryEvent event = mock(MethodEntryEvent.class);
        Method method = mock(Method.class);
        ReferenceType referenceType = mock(ReferenceType.class);
        Location location = mock(Location.class);

        when(referenceType.name()).thenReturn(className);
        when(method.declaringType()).thenReturn(referenceType);
        when(method.name()).thenReturn(methodName);
        when(method.signature()).thenReturn(signature == null ? "" : signature);
        when(location.lineNumber()).thenReturn(lineNumber);
        when(event.location()).thenReturn(location);
        when(event.method()).thenReturn(method);
        when(event.thread()).thenReturn(thread);

        return event;
    }

    private static MethodExitEvent methodExitEvent(String className,
                                                   String methodName,
                                                   String signature,
                                                   int lineNumber,
                                                   ThreadReference thread) {
        MethodExitEvent event = mock(MethodExitEvent.class);
        Method method = mock(Method.class);
        ReferenceType referenceType = mock(ReferenceType.class);
        Location location = mock(Location.class);

        when(referenceType.name()).thenReturn(className);
        when(method.declaringType()).thenReturn(referenceType);
        when(method.name()).thenReturn(methodName);
        when(method.signature()).thenReturn(signature == null ? "" : signature);
        when(location.lineNumber()).thenReturn(lineNumber);
        when(event.location()).thenReturn(location);
        when(event.method()).thenReturn(method);
        when(event.thread()).thenReturn(thread);

        return event;
    }

    @Test
    @DisplayName("Always logs start class even when excluded")
    void testAlwaysLogsStartClassEvenWhenExcluded() throws IOException {
        //Given
        //Configuration excludes the start class package but tracing should still record it
        TestTimeSource timeSource = new TestTimeSource(0L, 5L, 10L, 15L, 20L);
        SimpleDebugVM.MethodTraceConfig config = new SimpleDebugVM.MethodTraceConfig(
                "com.example.Root", "execute", null,
                Collections.emptyList(), Collections.singletonList("com.example"), true,
                -1, 0L);
        MethodEntryRequest entryRequest = mock(MethodEntryRequest.class);
        MethodExitRequest exitRequest = mock(MethodExitRequest.class);
        EventRequestManager erm = mock(EventRequestManager.class);
        when(erm.createMethodEntryRequest()).thenReturn(entryRequest);
        when(erm.createMethodExitRequest()).thenReturn(exitRequest);

        SimpleDebugVM.MethodTraceSession session = new SimpleDebugVM.MethodTraceSession(config, erm, timeSource);
        session.enableRequests();

        ThreadReference thread = mock(ThreadReference.class);
        when(thread.name()).thenReturn("main");
        MethodEntryEvent startEntry = methodEntryEvent("com.example.Root", "execute", null, 10, thread);
        MethodExitEvent startExit = methodExitEvent("com.example.Root", "execute", null, 12, thread);

        //When
        //The excluded-but-start method is entered and exited
        session.onMethodEntry(startEntry);
        session.onMethodExit(startExit);

        //Then
        //Events should be recorded despite the exclusion rule
        List<SimpleDebugVM.MethodTraceEvent> events = session.getEvents();
        assertEquals(2, events.size());
        assertEquals("com.example.Root", events.get(0).className);
        assertEquals(SimpleDebugVM.TraceEventType.EXIT, events.get(1).type);

        // Save trace output
        saveTraceOutput("05-start-class-always-logged.txt", session);
    }

    @Test
    @DisplayName("processUsingConfig builds JSON trace using mocked VM")
    void testProcessUsingConfigBuildsJsonUsingMockedVm() throws Exception {
        //Given
        //A JavaTrailCam instance with a mocked SimpleDebugVM and deterministic session data
        SimpleDebugVM vm = mock(SimpleDebugVM.class);
        SimpleDebugVM.MethodTraceSession session = mock(SimpleDebugVM.MethodTraceSession.class);
        TestableJavaTrailCam cam = new TestableJavaTrailCam(vm);

        when(session.awaitCompletion(anyLong())).thenReturn(true);
        when(session.hasStarted()).thenReturn(true);
        when(session.isCompleted()).thenReturn(true);
        when(session.isTimedOut()).thenReturn(false);
        when(session.getCompletionReason()).thenReturn("Returned to start method");
        when(session.getTraceStartTime()).thenReturn(1000L);
        when(session.getTraceEndTime()).thenReturn(1600L);

        List<SimpleDebugVM.MethodTraceEvent> events = List.of(
                new SimpleDebugVM.MethodTraceEvent(
                        SimpleDebugVM.TraceEventType.ENTER,
                        "com.example.Root",
                        "entryPoint",
                        null,
                        42,
                        0,
                        "main",
                        1000L,
                        0L,
                        0L
                ),
                new SimpleDebugVM.MethodTraceEvent(
                        SimpleDebugVM.TraceEventType.EXIT,
                        "com.example.Root",
                        "entryPoint",
                        null,
                        45,
                        0,
                        "main",
                        1600L,
                        600L,
                        600L
                )
        );
        when(session.getEvents()).thenReturn(events);
        when(vm.startMethodTrace(any(SimpleDebugVM.MethodTraceConfig.class))).thenReturn(session);

        String configJson = """
                {
                  "host":"localhost",
                  "port":"5005",
                  "startClass":"com.example.Root",
                  "startMethod":"entryPoint",
                  "includePackages":["com.example.domain"],
                  "excludePackages":["com.example.excluded"],
                  "skipOutsideDomain":true,
                  "maxDepth":3,
                  "maxDurationMillis":3000,
                  "awaitCompletionMillis":4000
                }
                """;

        //When
        String traceJson = cam.processUsingConfig(configJson);

        //Then
        assertFalse(traceJson.startsWith("Exception"), () -> "Unexpected failure: " + traceJson);
        assertEquals("localhost", cam.getConnectedHost());
        assertEquals("5005", cam.getConnectedPort());

        ArgumentCaptor<SimpleDebugVM.MethodTraceConfig> configCaptor =
                ArgumentCaptor.forClass(SimpleDebugVM.MethodTraceConfig.class);
        verify(vm).startMethodTrace(configCaptor.capture());
        SimpleDebugVM.MethodTraceConfig capturedConfig = configCaptor.getValue();
        assertEquals("com.example.Root", capturedConfig.startClass);
        assertEquals("entryPoint", capturedConfig.startMethod);
        assertEquals(Collections.singletonList("com.example.domain"), capturedConfig.includePackages);
        assertEquals(Collections.singletonList("com.example.excluded"), capturedConfig.excludePackages);
        assertTrue(capturedConfig.skipOutsideDomain);
        assertEquals(3, capturedConfig.maxDepth);
        assertEquals(3000L, capturedConfig.maxDurationMillis);

        verify(session).awaitCompletion(4000L);
        verify(vm).disconnect();

        EntityTree.TreeEntity root = JsonHelper.parseObject("javaTrailCamTrace", traceJson.trim()).getRoot();
        assertEquals("localhost", root.getChild("host").getValue());
        assertEquals("5005", root.getChild("port").getValue());
        assertEquals("Returned to start method", root.getChild("completionReason").getValue());
        assertEquals("false", root.getChild("timedOut").getValue());
        assertEquals("2", root.getChild("eventCount").getValue());

        EntityTree.TreeEntity eventsNode = root.getChild("events");
        assertEquals("ENTER", eventsNode.getChild("0").getChild("type").getValue());
        assertEquals("com.example.Root", eventsNode.getChild("0").getChild("className").getValue());
        assertEquals("EXIT", eventsNode.getChild("1").getChild("type").getValue());

        // Save JSON trace output
        saveJsonOutput("06-process-using-config.json", traceJson);
    }

    private static final class TestableJavaTrailCam extends JavaTrailCam {
        private final SimpleDebugVM vm;
        private String connectedHost;
        private String connectedPort;

        TestableJavaTrailCam(SimpleDebugVM vm) {
            this.vm = vm;
        }

        @Override
        public SimpleDebugVM connect(String host, String port) {
            this.connectedHost = host;
            this.connectedPort = port;
            return vm;
        }

        String getConnectedHost() {
            return connectedHost;
        }

        String getConnectedPort() {
            return connectedPort;
        }
    }

    private static final class TestTimeSource implements Supplier<Long> {
        private final Deque<Long> values;
        private Long lastValue;

        TestTimeSource(Long... values) {
            this.values = new ArrayDeque<>(Arrays.asList(values));
        }

        @Override
        public Long get() {
            if (!values.isEmpty()) {
                lastValue = values.removeFirst();
            }
            if (lastValue == null) {
                lastValue = 0L;
            }
            return lastValue;
        }
    }

    private void saveTraceOutput(String fileName, SimpleDebugVM.MethodTraceSession session) throws IOException {
        Path outputDir = Paths.get("src/test/resources/trace-outputs");
        Files.createDirectories(outputDir);

        Path outputFile = outputDir.resolve(fileName);
        StringBuilder output = new StringBuilder();

        output.append("=== Method Trace Session Output ===\n");
        output.append("Started: ").append(session.hasStarted()).append("\n");
        output.append("Completed: ").append(session.isCompleted()).append("\n");
        output.append("Timed Out: ").append(session.isTimedOut()).append("\n");
        output.append("Completion Reason: ").append(session.getCompletionReason()).append("\n");
        output.append("Trace Start Time: ").append(session.getTraceStartTime()).append("\n");
        output.append("Trace End Time: ").append(session.getTraceEndTime()).append("\n");
        output.append("\n=== Trace Events ===\n");

        List<SimpleDebugVM.MethodTraceEvent> events = session.getEvents();
        for (int i = 0; i < events.size(); i++) {
            SimpleDebugVM.MethodTraceEvent event = events.get(i);
            output.append(String.format("[%d] %s: %s.%s%s @ line %d (depth=%d, thread=%s, timestamp=%d, elapsed=%d, duration=%d)\n",
                i,
                event.type,
                event.className,
                event.methodName,
                event.signature,
                event.lineNumber,
                event.depth,
                event.threadName,
                event.timestampMillis,
                event.elapsedMillis,
                event.durationMillis
            ));
        }

        output.append("\n=== Summary ===\n");
        output.append("Total Events: ").append(events.size()).append("\n");

        Files.write(outputFile, output.toString().getBytes());
        System.out.println("Saved trace output to: " + outputFile.toAbsolutePath());
    }

    private void saveJsonOutput(String fileName, String jsonContent) throws IOException {
        Path outputDir = Paths.get("src/test/resources/trace-outputs");
        Files.createDirectories(outputDir);

        Path outputFile = outputDir.resolve(fileName);
        Files.writeString(outputFile, jsonContent, StandardCharsets.UTF_8);
        System.out.println("Saved JSON trace output to: " + outputFile.toAbsolutePath());
    }
}
