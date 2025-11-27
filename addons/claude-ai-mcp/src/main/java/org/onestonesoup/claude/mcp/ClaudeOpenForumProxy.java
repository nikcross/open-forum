package org.onestonesoup.claude.mcp;

import org.onestonesoup.client.OpenForumClient;
import org.onestonesoup.javascript.engine.JSON;
import org.onestonesoup.javascript.engine.JavascriptEngine;
import org.mozilla.javascript.NativeArray;
import org.mozilla.javascript.NativeObject;
import org.mozilla.javascript.Undefined;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Properties;

public class ClaudeOpenForumProxy {
    private static final String DEFAULT_LOG_RELATIVE_PATH = "Documents/AI/proxy-log.txt";
    private static final String DOWNLOAD_DIRECTORY_NAME = "OpenForumDownloads";

    private String VERSION;
    private final ClaudeServerClient client;
    final JavascriptEngine jsEngine;
    private final String pageName;
    private final String logFileName;
    private final Path downloadDirectory;

    public static void main(String[] args) throws Exception {
        System.err.println("Starting ClaudeOpenForumProxy");
        ClaudeOpenForumProxy proxy = new ClaudeOpenForumProxy(
                args[0],  // host
                args[1],  // pageName
                args[2],  // userId
                args[3],  // password
                Boolean.parseBoolean(args[4])      // hashed password
        );
        proxy.start();
    }

    public ClaudeOpenForumProxy(String host, String pageName, String userId, String password, boolean hashedPassword) throws Exception {
        this.VERSION = null;
        this.jsEngine = JavascriptEngine.getInstance();
        this.pageName = pageName;
        this.logFileName = resolveDefaultLogPath().toString();
        ensureLogFileExists(this.logFileName);

        logMessage("Connecting ClaudeOpenForumProxy " + getVersion());
        logMessage("Host:" + host);
        logMessage("PageName:" + pageName);
        logMessage("UserId:" + userId);

        OpenForumClient openForumClient = new OpenForumClient(host, userId, password, hashedPassword);
        this.client = new OpenForumClientAdapter(openForumClient);
        this.downloadDirectory = initDownloadDirectory(null);
    }

    /**
     * Package-private constructor for tests.
     */
    ClaudeOpenForumProxy(ClaudeServerClient client, String pageName, Path logFile, Path downloadDirectory) throws IOException {
        this.VERSION = null;
        this.jsEngine = JavascriptEngine.getInstance();
        this.pageName = pageName;
        Path logPath = (logFile == null) ? resolveDefaultLogPath() : logFile.toAbsolutePath().normalize();
        this.logFileName = logPath.toString();
        ensureLogFileExists(this.logFileName);
        this.client = Objects.requireNonNull(client, "client");
        this.downloadDirectory = initDownloadDirectory(downloadDirectory);
    }

    private Path resolveDefaultLogPath() {
        String userHome = System.getProperty("user.home", ".");
        return Paths.get(userHome, DEFAULT_LOG_RELATIVE_PATH);
    }

    private void ensureLogFileExists(String target) throws IOException {
        Path path = Paths.get(target);
        Path parent = path.getParent();
        if (parent != null) {
            Files.createDirectories(parent);
        }
        if (!Files.exists(path)) {
            Files.createFile(path);
        }
    }

    private Path initDownloadDirectory(Path override) throws IOException {
        Path path;
        if (override != null) {
            path = override.toAbsolutePath().normalize();
        } else {
            String userHome = System.getProperty("user.home", ".");
            path = Paths.get(userHome, DOWNLOAD_DIRECTORY_NAME).toAbsolutePath().normalize();
        }
        Files.createDirectories(path);
        return path;
    }

    private String readCompleteJsonMessage(BufferedReader reader) throws IOException {
        StringBuilder jsonBuilder = new StringBuilder();
        int braceCount = 0;
        boolean inString = false;
        boolean escaped = false;
        boolean jsonStarted = false;
        String line;

        while ((line = reader.readLine()) != null) {
            for (int i = 0; i < line.length(); i++) {
                char c = line.charAt(i);

                if (!jsonStarted && c == '{') {
                    jsonStarted = true;
                }

                if (!jsonStarted) {
                    continue;
                }

                jsonBuilder.append(c);

                if (escaped) {
                    escaped = false;
                    continue;
                }

                if (c == '\\' && inString) {
                    escaped = true;
                    continue;
                }

                if (c == '"') {
                    inString = !inString;
                    continue;
                }

                if (!inString) {
                    if (c == '{') {
                        braceCount++;
                    } else if (c == '}') {
                        braceCount--;
                        if (braceCount == 0) {
                            return jsonBuilder.toString();
                        }
                    }
                }
            }

            if (jsonStarted) {
                jsonBuilder.append('\n');
            }
        }

        return jsonBuilder.toString();
    }

    public void start() {
        logMessage("Proxy started");

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(System.in))) {
            String request;
            while ((request = readCompleteJsonMessage(reader)) != null) {
                if (request.trim().isEmpty()) {
                    continue;
                }

                try {
                    String response = handleRequest(request.trim());
                    if (response != null) {
                        sendMessage(response);
                    }
                } catch (Throwable e) {
                    logMessage("Error processing request:" + e.getMessage());
                    logMessage("Request was:" + request);
                }
            }
        } catch (IOException e) {
            logMessage("Error reading from stdin:" + e.getMessage());
        }

        logMessage("Proxy Stopped");
    }

    private void sendMessage(String message) {
        logMessage("Preparing to send response payload of " + (message == null ? 0 : message.length()) + " bytes");
        try {
            System.out.println(message);
            System.out.flush();
            if (System.out.checkError()) {
                logMessage("Stdout checkError() returned true after sending response");
            } else {
                logMessage("Stdout write completed without immediate error");
            }
        } catch (Throwable throwable) {
            logMessage("Exception while sending response:" + throwable);
        }

        try {
            Files.write(
                    Paths.get(logFileName),
                    ("\tSent: [" + message + "]\n\n").getBytes(),
                    StandardOpenOption.APPEND
            );
        } catch (IOException e) {
            // Ignore logging errors
        }
    }

    public String handleRequest(String request) throws Throwable {
        Map<String, String> params = new HashMap<>();
        params.put("request", request);

        logMessage("Handling request:" + request);

        String response = client.doPost(pageName + "?action=handleRequest", params);

        logMessage("Received response:" + response + "\n for request:" + request);

        JSON json = new JSON(jsEngine);
        NativeObject responseObj = (NativeObject) json.parse(response);
        Object dataObject = responseObj.get("data");

        if (dataObject instanceof NativeObject) {
            NativeObject dataNative = (NativeObject) dataObject;
            handleFileTransferContent(dataNative);
            attachProxyVersion(dataNative);
        }

        String data = json.stringify(dataObject).toString();

        if ("\"ok\"".equals(data)) {
            logMessage("Successfully notification processed request:" + data);
            return null;
        }

        return data;
    }

    void handleFileTransferContent(NativeObject dataObject) throws IOException {
        Object resultObj = dataObject.get("result");
        if (!(resultObj instanceof NativeObject)) {
            return;
        }
        NativeObject result = (NativeObject) resultObj;
        Object contentObj = result.get("content");
        if (!(contentObj instanceof NativeArray)) {
            return;
        }
        NativeArray content = (NativeArray) contentObj;
        int length = (int) content.getLength();
        for (int i = 0; i < length; i++) {
            Object entryObj = content.get(i, content);
            if (!(entryObj instanceof NativeObject)) {
                continue;
            }
            NativeObject entry = (NativeObject) entryObj;
            String type = coerceToString(entry.get("type"));
            if (type == null || !"text".equalsIgnoreCase(type)) {
                continue;
            }
            String text = coerceToString(entry.get("text"));
            if (text == null) {
                continue;
            }
            maybeHandleFileTransferPayload(text, entry, result);
        }
    }

    private void attachProxyVersion(NativeObject dataObject) {
        try {
            Object resultObj = dataObject.get("result");
            if (!(resultObj instanceof NativeObject)) {
                return;
            }
            NativeObject result = (NativeObject) resultObj;
            result.put("proxyVersion", result, getVersion());
        } catch (Throwable ignored) {
            // Non-fatal, version reporting is best-effort
        }
    }

    private void maybeHandleFileTransferPayload(String text, NativeObject contentEntry, NativeObject result) throws IOException {
        JSON json = new JSON(jsEngine);
        NativeObject payload;
        try {
            Object parsed = json.parse(text);
            if (!(parsed instanceof NativeObject)) {
                return;
            }
            payload = (NativeObject) parsed;
        } catch (Throwable parseException) {
            return;
        }

        String directive = coerceToString(payload.get("directive"));
        if (directive == null) {
            directive = coerceToString(payload.get("type"));
        }
        if (directive == null || !"file-transfer".equalsIgnoreCase(directive)) {
            return;
        }

        String direction = coerceToString(payload.get("direction"));
        if (direction == null) {
            direction = coerceToString(payload.get("operation"));
        }
        String page = coerceToString(payload.get("pageName"));
        if (page == null) {
            page = coerceToString(payload.get("page"));
        }
        String fileName = coerceToString(payload.get("fileName"));
        if (fileName == null) {
            fileName = coerceToString(payload.get("file"));
        }
        String localPath = coerceToString(payload.get("localPath"));
        if (localPath == null) {
            localPath = coerceToString(payload.get("path"));
        }

        if (direction == null || page == null || fileName == null) {
            appendContent(result, "Invalid file transfer directive: missing operation, pageName, or fileName.");
            return;
        }

        direction = direction.toLowerCase(Locale.ROOT);
        String summary;
        try {
            if ("download".equals(direction) || "receive".equals(direction)) {
                Path destination = resolveDownloadTarget(localPath, page, fileName);
                client.downloadFile(page, fileName, destination.toString());
                summary = "Downloaded " + page + "/" + fileName + " to " + destination;
            } else if ("upload".equals(direction) || "send".equals(direction)) {
                if (localPath == null || localPath.trim().isEmpty()) {
                    throw new IOException("localPath is required for uploads");
                }
                Path source = resolveUploadSource(localPath);
                client.uploadFile(page, fileName, source.toString());
                String verificationNote = verifyRemoteAttachment(page, fileName);
                if (verificationNote != null && !verificationNote.isEmpty()) {
                    summary = "Uploaded " + source + " to " + page + "/" + fileName + " (" + verificationNote + ")";
                } else {
                    summary = "Uploaded " + source + " to " + page + "/" + fileName;
                }
            } else {
                appendContent(result, "Unsupported file transfer operation: " + direction);
                return;
            }
            logMessage(summary);
            contentEntry.put("text", contentEntry, summary);
        } catch (IOException ioException) {
            String failure = "File transfer failed (" + direction + " " + page + "/" + fileName + "): " + ioException.getMessage();
            logMessage(failure);
            contentEntry.put("text", contentEntry, failure);
        }
    }

    private void appendContent(NativeObject result, String message) {
        if (message == null || message.isEmpty()) {
            return;
        }
        Object contentObj = result.get("content");
        NativeArray content;
        if (contentObj instanceof NativeArray) {
            content = (NativeArray) contentObj;
        } else {
            content = new NativeArray(0);
            result.put("content", result, content);
        }

        NativeObject entry = new NativeObject();
        entry.put("type", entry, "text");
        entry.put("text", entry, message);
        int index = (int) content.getLength();
        content.put(index, content, entry);
    }

    private String coerceToString(Object value) {
        if (value == null || value instanceof Undefined) {
            return null;
        }
        return String.valueOf(value);
    }

    private Path resolveDownloadTarget(String providedPath, String pageName, String fileName) throws IOException {
        Path target;
        if (providedPath == null || providedPath.trim().isEmpty()) {
            target = downloadDirectory.resolve(sanitizePageName(pageName)).resolve(fileName);
        } else {
            String trimmed = providedPath.trim();
            Path candidate = Paths.get(trimmed).toAbsolutePath().normalize();
            boolean treatAsDirectory = (Files.exists(candidate) && Files.isDirectory(candidate)) || isDirectoryHint(trimmed);

            if (treatAsDirectory) {
                Files.createDirectories(candidate);
                target = candidate.resolve(fileName);
            } else {
                Path parent = candidate.getParent();
                if (parent != null) {
                    Files.createDirectories(parent);
                }
                target = candidate;
            }
        }

        Path parent = target.getParent();
        if (parent != null) {
            Files.createDirectories(parent);
        }
        return target;
    }

    private boolean isDirectoryHint(String candidate) {
        return candidate.endsWith("/") || candidate.endsWith("\\") || ".".equals(candidate) || "..".equals(candidate);
    }

    private String sanitizePageName(String pageName) {
        if (pageName == null || pageName.trim().isEmpty()) {
            return "root";
        }
        String sanitized = pageName.replace('\\', '/').replaceAll("^/+", "");
        sanitized = sanitized.replaceAll("[/]+", "_");
        sanitized = sanitized.replaceAll("[^A-Za-z0-9._-]", "_");
        if (sanitized.isEmpty()) {
            sanitized = "root";
        }
        return sanitized;
    }

    private Path resolveUploadSource(String localPath) throws IOException {
        Path source = Paths.get(localPath).toAbsolutePath().normalize();
        if (!Files.exists(source)) {
            throw new IOException("Local file not found: " + source);
        }
        if (!Files.isRegularFile(source)) {
            throw new IOException("Local path is not a file: " + source);
        }
        return source;
    }

    private String verifyRemoteAttachment(String pageName, String fileName) {
        try {
            String endpoint = "OpenForum/Actions/Attachments?pageName=" + encode(pageName) +
                    "&matching=" + encode(fileName) + "&metaData=true";
            String response = client.doGet(endpoint);
            JSON json = new JSON(jsEngine);
            Object parsed = json.parse(response);
            if (!(parsed instanceof NativeObject)) {
                return "verification returned unexpected payload";
            }
            NativeObject payload = (NativeObject) parsed;
            Object attachmentsObj = payload.get("attachments");
            if (!(attachmentsObj instanceof NativeArray)) {
                return "verification missing attachments list";
            }
            NativeArray attachments = (NativeArray) attachmentsObj;
            int length = (int) attachments.getLength();
            for (int i = 0; i < length; i++) {
                Object attachmentObj = attachments.get(i, attachments);
                if (!(attachmentObj instanceof NativeObject)) {
                    continue;
                }
                NativeObject attachment = (NativeObject) attachmentObj;
                String name = coerceToString(attachment.get("fileName"));
                if (fileName.equals(name)) {
                    String size = coerceToString(attachment.get("size"));
                    return "verified on server (" + (size == null ? "size unknown" : size + " bytes") + ")";
                }
            }
            return "verification did not find uploaded file";
        } catch (Throwable verificationError) {
            logMessage("Verification error for " + pageName + "/" + fileName + ":" + verificationError);
            return "verification failed: " + verificationError.getMessage();
        }
    }

    private String encode(String value) {
        if (value == null) {
            return "";
        }
        try {
            return URLEncoder.encode(value, StandardCharsets.UTF_8.name());
        } catch (Exception e) {
            return value;
        }
    }

    private void logMessage(String message) {
        try {
            Files.write(
                    Paths.get(logFileName),
                    ("Msg:" + message + "\n\n").getBytes(),
                    StandardOpenOption.APPEND
            );
        } catch (IOException e) {
            // Ignore logging errors
        }
    }

    public String getVersion() {
        if (VERSION != null) {
            return VERSION;
        }

        Properties props = new Properties();
        try {
            props.load(getClass().getResourceAsStream("/META-INF/maven/org.onestonesoup/claude-ai-mcp/pom.properties"));
            VERSION = props.getProperty("version");
        } catch (Exception e) {
            VERSION = "Unknown";
        }

        return VERSION;
    }
}
