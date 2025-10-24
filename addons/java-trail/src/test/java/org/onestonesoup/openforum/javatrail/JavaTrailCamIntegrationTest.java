package org.onestonesoup.openforum.javatrail;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.PrintStream;
import java.net.ServerSocket;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.TimeUnit;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Timeout;
import org.onestonesoup.core.data.EntityTree;
import org.onestonesoup.core.data.JsonHelper;

@Timeout(value = 30)
class JavaTrailCamIntegrationTest {

    @Test
    @DisplayName("Produces JSON trace filtered to domain packages")
    void testProducesJsonTraceFilteredToDomainPackages() throws Exception {
        //Given
        //A sample application running under JDWP for tracing
        int port = findFreePort();
        Process sampleProcess = launchSampleApplication(port);
        Thread.sleep(500);
        Path configFile = writeConfig(port,
                Collections.singletonList("org.onestonesoup.openforum.javatrail.sample.domain"),
                Collections.singletonList("org.onestonesoup.openforum.javatrail.sample.lib"),
                true,
                -1,
                30000,
                35000,
                null);
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        PrintStream previousOut = System.out;
        System.setOut(new PrintStream(output, true, StandardCharsets.UTF_8));

        try {
            //When
            //JavaTrailCam runs against the sample application
            JavaTrailCam.main(new String[]{configFile.toString()});
        } finally {
            System.setOut(previousOut);
            Files.deleteIfExists(configFile);
            waitForProcessTermination(sampleProcess);
        }

        //Then
        //The JSON trace should contain only domain classes and start method
        EntityTree.TreeEntity root = parseTrace(output);
        assertEquals("Returned to start method", root.getChild("completionReason").getValue());
        assertEquals("false", root.getChild("timedOut").getValue());

        List<EventRecord> events = readEvents(root);
        assertEquals(events.size(), Integer.parseInt(root.getChild("eventCount").getValue()));
        assertTrue(events.size() >= 4);
        events.forEach(event -> assertTrue(
                event.className.equals("org.onestonesoup.openforum.javatrail.sample.SampleApplication")
                        || event.className.startsWith("org.onestonesoup.openforum.javatrail.sample.domain"),
                () -> "Unexpected class in trace: " + event.className));
        assertTrue(events.stream().noneMatch(event ->
                event.className.startsWith("org.onestonesoup.openforum.javatrail.sample.lib")
                        || event.className.startsWith("java.util")));
    }

    @Test
    @DisplayName("Stops tracing when configured max depth is reached")
    void testStopsTracingWhenMaxDepthIsReached() throws Exception {
        //Given
        //A sample application with max depth limit forcing early trace completion
        int port = findFreePort();
        Process sampleProcess = launchSampleApplication(port);
        Thread.sleep(500);
        Path configFile = writeConfig(port,
                Collections.singletonList("org.onestonesoup.openforum.javatrail.sample.domain"),
                Collections.emptyList(),
                true,
                1,
                10000,
                12000,
                null);
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        PrintStream previousOut = System.out;
        System.setOut(new PrintStream(output, true, StandardCharsets.UTF_8));

        try {
            //When
            //JavaTrailCam enforces the depth limit during tracing
            JavaTrailCam.main(new String[]{configFile.toString()});
        } finally {
            System.setOut(previousOut);
            Files.deleteIfExists(configFile);
            waitForProcessTermination(sampleProcess);
        }

        //Then
        //The trace should end at the configured depth without timing out
        EntityTree.TreeEntity root = parseTrace(output);
        assertEquals("Reached maxDepth", root.getChild("completionReason").getValue());
        assertEquals("false", root.getChild("timedOut").getValue());

        List<EventRecord> events = readEvents(root);
        assertEquals(1, events.size());
        assertEquals(Integer.parseInt(root.getChild("eventCount").getValue()), events.size());
        assertTrue(events.stream().allMatch(event ->
                event.className.equals("org.onestonesoup.openforum.javatrail.sample.SampleApplication")
                        || event.className.startsWith("org.onestonesoup.openforum.javatrail.sample.domain")));
    }

    @Test
    @DisplayName("processUsingConfig emits trace JSON")
    void testProcessUsingConfigEmitsTraceJson() throws Exception {
        //Given
        //A JSON configuration string for the sample application
        int port = findFreePort();
        Process sampleProcess = launchSampleApplication(port);
        Thread.sleep(500);
        String configJson = buildConfigJson(port,
                Collections.singletonList("org.onestonesoup.openforum.javatrail.sample.domain"),
                Collections.singletonList("org.onestonesoup.openforum.javatrail.sample.lib"),
                true,
                -1,
                30000,
                35000,
                null);
        JavaTrailCam cam = new JavaTrailCam();
        String traceJson;

        try {
            //When
            //processUsingConfig runs the trace against the sample application
            traceJson = cam.processUsingConfig(configJson);
        } finally {
            waitForProcessTermination(sampleProcess);
        }

        //Then
        //The returned JSON should indicate successful completion within domain packages
        EntityTree.TreeEntity root = parseTrace(traceJson);
        assertEquals("Returned to start method", root.getChild("completionReason").getValue());
        assertEquals("false", root.getChild("timedOut").getValue());
        List<EventRecord> events = readEvents(root);
        assertTrue(events.size() >= 4);
        events.forEach(event -> assertTrue(
                event.className.equals("org.onestonesoup.openforum.javatrail.sample.SampleApplication")
                        || event.className.startsWith("org.onestonesoup.openforum.javatrail.sample.domain"),
                () -> "Unexpected class in trace: " + event.className));
    }

    private static EntityTree.TreeEntity parseTrace(ByteArrayOutputStream output) {
        return parseTrace(output.toString(StandardCharsets.UTF_8));
    }

    private static EntityTree.TreeEntity parseTrace(String json) {
        EntityTree tree = JsonHelper.parseObject("javaTrailCamTrace", json.trim());
        return tree.getRoot();
    }

    private static List<EventRecord> readEvents(EntityTree.TreeEntity root) {
        EntityTree.TreeEntity eventsNode = root.getChild("events");
        List<EventRecord> events = new ArrayList<>();
        if (eventsNode == null) {
            return events;
        }
        for (EntityTree.TreeEntity child : eventsNode.getChildren()) {
            events.add(new EventRecord(
                    child.getChild("type").getValue(),
                    child.getChild("className").getValue(),
                    child.getChild("methodName").getValue()));
        }
        return events;
    }

    private static Path writeConfig(int port,
                                    List<String> includePackages,
                                    List<String> excludePackages,
                                    boolean skipOutsideDomain,
                                    int maxDepth,
                                    long maxDurationMillis,
                                    long awaitCompletionMillis,
                                    Path outputFile) throws IOException {
        String json = buildConfigJson(port, includePackages, excludePackages, skipOutsideDomain,
                maxDepth, maxDurationMillis, awaitCompletionMillis, outputFile);

        Path configFile = Files.createTempFile("javatrailcam-config", ".json");
        Files.writeString(configFile, json, StandardCharsets.UTF_8);
        return configFile;
    }

    private static String buildConfigJson(int port,
                                          List<String> includePackages,
                                          List<String> excludePackages,
                                          boolean skipOutsideDomain,
                                          int maxDepth,
                                          long maxDurationMillis,
                                          long awaitCompletionMillis,
                                          Path outputFile) {
        String includeJson = toJsonArray(includePackages);
        String excludeJson = toJsonArray(excludePackages);
        StringBuilder builder = new StringBuilder();
        builder.append("{")
                .append("\"host\":\"localhost\",")
                .append("\"port\":\"").append(port).append("\",")
                .append("\"startClass\":\"org.onestonesoup.openforum.javatrail.sample.SampleApplication\",")
                .append("\"startMethod\":\"entryPoint\",")
                .append("\"includePackages\":").append(includeJson).append(",")
                .append("\"excludePackages\":").append(excludeJson).append(",")
                .append("\"skipOutsideDomain\":").append(skipOutsideDomain).append(",")
                .append("\"maxDepth\":").append(maxDepth).append(",")
                .append("\"maxDurationMillis\":").append(maxDurationMillis).append(",")
                .append("\"awaitCompletionMillis\":").append(awaitCompletionMillis);
        if (outputFile != null) {
            builder.append(",\"outputFile\":\"").append(outputFile.toAbsolutePath()).append("\"");
        }
        builder.append("}");
        return builder.toString();
    }

    private static String toJsonArray(List<String> values) {
        if (values == null || values.isEmpty()) {
            return "[]";
        }
        StringBuilder builder = new StringBuilder("[");
        for (int i = 0; i < values.size(); i++) {
            if (i > 0) {
                builder.append(",");
            }
            builder.append("\"").append(values.get(i)).append("\"");
        }
        builder.append("]");
        return builder.toString();
    }

    private static Process launchSampleApplication(int port) throws IOException {
        String javaHome = System.getProperty("java.home");
        Path javaBin = Paths.get(javaHome, "bin", "java");
        String agentArg = "-agentlib:jdwp=transport=dt_socket,server=y,suspend=y,address=localhost:" + port;
        String classpath = Paths.get("target", "test-classes").toAbsolutePath().toString();

        List<String> command = new ArrayList<>();
        command.add(javaBin.toString());
        command.add(agentArg);
        command.add("-cp");
        command.add(classpath);
        command.add("org.onestonesoup.openforum.javatrail.sample.SampleApplication");

        ProcessBuilder builder = new ProcessBuilder(command);
        builder.redirectOutput(ProcessBuilder.Redirect.DISCARD);
        builder.redirectError(ProcessBuilder.Redirect.DISCARD);
        return builder.start();
    }

    private static int findFreePort() throws IOException {
        try (ServerSocket socket = new ServerSocket(0)) {
            socket.setReuseAddress(true);
            return socket.getLocalPort();
        }
    }

    private static void waitForProcessTermination(Process process) {
        if (process == null) {
            return;
        }
        try {
            if (!process.waitFor(5, TimeUnit.SECONDS)) {
                process.destroy();
                process.waitFor(2, TimeUnit.SECONDS);
                if (process.isAlive()) {
                    process.destroyForcibly();
                }
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            if (process.isAlive()) {
                process.destroyForcibly();
            }
        }
    }

    private static final class EventRecord {
        final String type;
        final String className;
        final String methodName;

        private EventRecord(String type, String className, String methodName) {
            this.type = type;
            this.className = className;
            this.methodName = methodName;
        }

    }
}
