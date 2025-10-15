package org.onestonesoup.openforum.javatrail;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.ArrayDeque;
import java.util.Arrays;
import java.util.Collections;
import java.util.Deque;
import java.util.List;
import java.util.function.Supplier;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

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
    void testCapturesStartMethodEntryAndExit() {
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
    }

    @Test
    @DisplayName("Maintains stack and filters logging outside include domain")
    void testMaintainsStackAndFiltersLoggingOutsideIncludeDomain() {
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
    }

    @Test
    @DisplayName("Stops tracing when max duration is exceeded")
    void testStopsTracingWhenMaxDurationExceeded() {
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
    }

    @Test
    @DisplayName("Stops tracing when max depth is exceeded")
    void testStopsTracingWhenMaxDepthExceeded() {
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
    void testAlwaysLogsStartClassEvenWhenExcluded() {
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
}
