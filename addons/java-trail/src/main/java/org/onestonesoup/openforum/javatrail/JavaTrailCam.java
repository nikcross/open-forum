package org.onestonesoup.openforum.javatrail;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import com.sun.jdi.connect.IllegalConnectorArgumentsException;

import org.onestonesoup.core.data.EntityTree;
import org.onestonesoup.core.data.JsonHelper;

public class JavaTrailCam {

    private volatile SimpleDebugVM activeVm;
    private volatile SimpleDebugVM.MethodTraceSession activeTraceSession;

    SimpleDebugVM getActiveVm() {
        return activeVm;
    }

    SimpleDebugVM.MethodTraceSession getActiveTraceSession() {
        return activeTraceSession;
    }

public static void main(String[] args) throws Exception {
    if (args.length == 0) {
        System.err.println("Usage: JavaTrailCam <config.json>");
        return;
    }

    Path configPath = Paths.get(args[0]).toAbsolutePath();
    if (!Files.exists(configPath)) {
        System.err.println("Configuration file not found: " + configPath);
        return;
    }

    Config config = Config.load(configPath);

    JavaTrailCam cam = new JavaTrailCam();
    SimpleDebugVM vm = cam.connect(config);
    try {
        SimpleDebugVM.MethodTraceConfig traceConfig = config.toMethodTraceConfig();
        SimpleDebugVM.MethodTraceSession session = vm.startMethodTrace(traceConfig);

        long awaitMillis = config.awaitCompletionMillis > 0
                ? config.awaitCompletionMillis
                : config.maxDurationMillis;
        session.awaitCompletion(awaitMillis);

        List<SimpleDebugVM.MethodTraceEvent> events = session.getEvents();
        String outputJson = buildOutput(config, session, events);

        if (config.outputFile != null && !config.outputFile.isEmpty()) {
            Path outputPath = config.outputFileIsAbsolute
                    ? Paths.get(config.outputFile).toAbsolutePath()
                    : configPath.getParent().resolve(config.outputFile).toAbsolutePath();
            Files.createDirectories(outputPath.getParent());
            Files.writeString(outputPath, outputJson, StandardCharsets.UTF_8);
            System.out.println("Trace written to " + outputPath);
        } else {
            System.out.println(outputJson);
        }
    } finally {
        vm.disconnect();
    }
}

public SimpleDebugVM connect(String host, String port) throws IllegalConnectorArgumentsException, IOException {
    return new SimpleDebugVM(host, port);
}

public String processUsingConfig(String configString) {
    SimpleDebugVM vm = null;

    try {
        Config config = Config.fromString(configString);
        vm = connect(config.getHost(), config.getPort());
        activeVm = vm;

        SimpleDebugVM.MethodTraceConfig traceConfig = config.toMethodTraceConfig();
        SimpleDebugVM.MethodTraceSession session = vm.startMethodTrace(traceConfig);
        activeTraceSession = session;

        long awaitMillis = config.awaitCompletionMillis > 0
                ? config.awaitCompletionMillis
                : config.maxDurationMillis;
        session.awaitCompletion(awaitMillis);

        List<SimpleDebugVM.MethodTraceEvent> events = session.getEvents();
        return buildOutput(config, session, events);
    } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
        return "Exception: " + e.toString();
    } catch (Exception e) {
        return "Exception: " + e.toString();
    } finally {
        activeTraceSession = null;
        if (vm != null) {
            try {
                vm.disconnect();
            } catch (Exception ignore) {
                // ignore disconnect issues
            }
        }
        activeVm = null;
    }
}

public SimpleDebugVM connect(Config config) throws IllegalConnectorArgumentsException, IOException {
    return connect(config.getHost(), config.getPort());
}

private static String buildOutput(Config config,
                                  SimpleDebugVM.MethodTraceSession session,
                                  List<SimpleDebugVM.MethodTraceEvent> events) {
    EntityTree tree = new EntityTree("javaTrailCamTrace");
    EntityTree.TreeEntity root = tree.getRoot();

    addValue(root, "host", config.host);
    addValue(root, "port", config.port);
    addValue(root, "startClass", config.startClass);
    addValue(root, "startMethod", config.startMethod);
    addOptionalValue(root, "startSignature", config.startSignature);
    addValue(root, "started", Boolean.toString(session.hasStarted()));
    addValue(root, "completed", Boolean.toString(session.isCompleted()));
    addValue(root, "timedOut", Boolean.toString(session.isTimedOut()));
    addValue(root, "completionReason", session.getCompletionReason());

    if (session.getTraceStartTime() > 0) {
        addValue(root, "traceStartTime", Long.toString(session.getTraceStartTime()));
    }
    if (session.getTraceEndTime() > 0) {
        addValue(root, "traceEndTime", Long.toString(session.getTraceEndTime()));
        if (session.getTraceStartTime() > 0) {
            addValue(root, "traceDurationMillis", Long.toString(session.getTraceEndTime() - session.getTraceStartTime()));
        }
    }

    addValue(root, "eventCount", Integer.toString(events.size()));
    addPackages(root.addChild("includePackages"), config.includePackages);
    addPackages(root.addChild("excludePackages"), config.excludePackages);

    EntityTree.TreeEntity eventsArray = root.addChild("events");
    eventsArray.setAttribute("array", "true");
    for (int i = 0; i < events.size(); i++) {
        SimpleDebugVM.MethodTraceEvent event = events.get(i);
        EntityTree.TreeEntity eventNode = eventsArray.addChild(Integer.toString(i));
        addValue(eventNode, "type", event.type.name());
        addValue(eventNode, "className", event.className);
        addValue(eventNode, "methodName", event.methodName);
        addOptionalValue(eventNode, "signature", event.signature);
        addValue(eventNode, "lineNumber", Integer.toString(event.lineNumber));
        addValue(eventNode, "depth", Integer.toString(event.depth));
        addOptionalValue(eventNode, "thread", event.threadName);
        addValue(eventNode, "timestampMillis", Long.toString(event.timestampMillis));
        addValue(eventNode, "elapsedMillis", Long.toString(event.elapsedMillis));
        addValue(eventNode, "durationMillis", Long.toString(event.durationMillis));
    }

    return JsonHelper.stringifyObject(root);
}

private static void addPackages(EntityTree.TreeEntity parent, List<String> packages) {
    parent.setAttribute("array", "true");
    for (int i = 0; i < packages.size(); i++) {
        EntityTree.TreeEntity child = parent.addChild(Integer.toString(i));
        child.setValue(packages.get(i));
    }
}

private static void addOptionalValue(EntityTree.TreeEntity parent, String name, String value) {
    if (value != null && !value.isEmpty()) {
        addValue(parent, name, value);
    }
}

private static void addValue(EntityTree.TreeEntity parent, String name, String value) {
    EntityTree.TreeEntity child = parent.getChild(name);
    if (child == null) {
        child = parent.addChild(name);
    }
    child.setValue(value);
}

static final class Config {
    private final String host;
    private final String port;
    private final String startClass;
    private final String startMethod;
    private final String startSignature;
    private final List<String> includePackages;
    private final List<String> excludePackages;
    private final boolean skipOutsideDomain;
    private final int maxDepth;
    private final long maxDurationMillis;
    private final long awaitCompletionMillis;
    private final String outputFile;
    private final boolean outputFileIsAbsolute;

    Config(String host,
           String port,
           String startClass,
           String startMethod,
           String startSignature,
           List<String> includePackages,
           List<String> excludePackages,
           boolean skipOutsideDomain,
           int maxDepth,
           long maxDurationMillis,
           long awaitCompletionMillis,
           String outputFile,
           boolean outputFileIsAbsolute) {
        this.host = host;
        this.port = port;
        this.startClass = startClass;
        this.startMethod = startMethod;
        this.startSignature = startSignature;
        this.includePackages = includePackages;
        this.excludePackages = excludePackages;
        this.skipOutsideDomain = skipOutsideDomain;
        this.maxDepth = maxDepth;
        this.maxDurationMillis = maxDurationMillis;
        this.awaitCompletionMillis = awaitCompletionMillis;
        this.outputFile = outputFile;
        this.outputFileIsAbsolute = outputFileIsAbsolute;
    }

    private SimpleDebugVM.MethodTraceConfig toMethodTraceConfig() {
        return new SimpleDebugVM.MethodTraceConfig(
                startClass,
                startMethod,
                startSignature,
                includePackages,
                excludePackages,
                skipOutsideDomain,
                maxDepth,
                maxDurationMillis
        );
    }

    static Config load(Path configPath) throws IOException {
        String json = Files.readString(configPath, StandardCharsets.UTF_8);
        return fromString(json);
    }

    public static Config fromString(String json) {
        EntityTree tree = JsonHelper.parseObject("javaTrailCamConfig", json);
        EntityTree.TreeEntity root = tree.getRoot();

        String host = getString(root, "host", "localhost");
        String port = getRequiredString(root, "port", "Debug port is required");
        String startClass = getRequiredString(root, "startClass", "startClass is required");
        String startMethod = getRequiredString(root, "startMethod", "startMethod is required");
        String startSignature = getString(root, "startSignature", null);

        List<String> includePackages = getStringArray(root, "includePackages");
        List<String> excludePackages = getStringArray(root, "excludePackages");
        boolean skipOutsideDomain = getBoolean(root, "skipOutsideDomain", false);
        int maxDepth = getInt(root, "maxDepth", -1);
        long maxDurationMillis = getLong(root, "maxDurationMillis", 0L);
        long awaitCompletionMillis = getLong(root, "awaitCompletionMillis", maxDurationMillis);
        String outputFile = getString(root, "outputFile", null);
        boolean outputFileIsAbsolute = outputFile != null && Paths.get(outputFile).isAbsolute();

        return new Config(
                host,
                port,
                startClass,
                startMethod,
                startSignature,
                includePackages,
                excludePackages,
                skipOutsideDomain,
                maxDepth,
                maxDurationMillis,
                awaitCompletionMillis,
                outputFile,
                outputFileIsAbsolute
        );
    }

    private static String getRequiredString(EntityTree.TreeEntity root, String name, String message) {
        String value = getString(root, name, null);
        if (value == null || value.isEmpty()) {
            throw new IllegalArgumentException(message);
        }
        return value;
    }

    private static String getString(EntityTree.TreeEntity root, String name, String defaultValue) {
        EntityTree.TreeEntity child = root.getChild(name);
        if (child == null || child.getValue() == null || child.getValue().isEmpty()) {
            return defaultValue;
        }
        return child.getValue();
    }

    private static long getLong(EntityTree.TreeEntity root, String name, long defaultValue) {
        String value = getString(root, name, null);
        if (value == null || value.isEmpty()) {
            return defaultValue;
        }
        try {
            return Long.parseLong(value);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid long value for " + name + ": " + value, e);
        }
    }

    private static int getInt(EntityTree.TreeEntity root, String name, int defaultValue) {
        String value = getString(root, name, null);
        if (value == null || value.isEmpty()) {
            return defaultValue;
        }
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid int value for " + name + ": " + value, e);
        }
    }

    private static boolean getBoolean(EntityTree.TreeEntity root, String name, boolean defaultValue) {
        String value = getString(root, name, null);
        if (value == null || value.isEmpty()) {
            return defaultValue;
        }
        return Boolean.parseBoolean(value);
    }

    private static List<String> getStringArray(EntityTree.TreeEntity root, String name) {
        EntityTree.TreeEntity child = root.getChild(name);
        if (child == null || child.getAttribute("array") == null) {
            return Collections.emptyList();
        }
        List<String> values = new ArrayList<>();
        for (EntityTree.TreeEntity element : child.getChildren()) {
            if (element.getValue() != null) {
                values.add(element.getValue());
            }
        }
        return Collections.unmodifiableList(values);
    }

    String getHost() {
        return host;
    }

    String getPort() {
        return port;
    }

    String getStartClass() {
        return startClass;
    }

    String getStartMethod() {
        return startMethod;
    }

    String getStartSignature() {
        return startSignature;
    }

    List<String> getIncludePackages() {
        return includePackages;
    }

    List<String> getExcludePackages() {
        return excludePackages;
    }

    boolean isSkipOutsideDomain() {
        return skipOutsideDomain;
    }

    int getMaxDepth() {
        return maxDepth;
    }

    long getMaxDurationMillis() {
        return maxDurationMillis;
    }

    long getAwaitCompletionMillis() {
        return awaitCompletionMillis;
    }

    String getOutputFile() {
        return outputFile;
    }

    boolean isOutputFileAbsolute() {
        return outputFileIsAbsolute;
    }
}
}
