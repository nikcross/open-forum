package org.onestonesoup.claude.mcp;

import org.onestonesoup.client.OpenForumClient;
import org.onestonesoup.javascript.engine.JavascriptEngine;
import org.onestonesoup.javascript.engine.JSON;
import org.mozilla.javascript.NativeObject;

import java.io.*;
import java.nio.file.*;
import java.util.*;

public class ClaudeOpenForumProxy {
    private String VERSION;
    private OpenForumClient client;
    JavascriptEngine jsEngine;
    private String pageName;
    private String logFileName;

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
        this.logFileName = "/home/nik/Documents/AI/proxy-log.txt";
        this.pageName = pageName;

        // Create log file if it doesn't exist
        File logFile = new File(this.logFileName);
        if (!logFile.exists()) {
            logFile.createNewFile();
        }

        logMessage("Connecting ClaudeOpenForumProxy" + getVersion());
        logMessage("Host:" + host);
        logMessage("PageName:" + pageName);
        logMessage("UserId:" + userId);
        logMessage("Password:" + password);

        this.client = new OpenForumClient(host, userId, password, hashedPassword);
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

                // Check if JSON has started
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

            // Add newline between lines if JSON has started
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
        System.out.println(message);

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
        String data = json.stringify(responseObj.get("data")).toString();

        if (data.equals("\"ok\"")) {
            logMessage("Successfully notification processed request:" + data);
            return null;
        }

        return data;
    }

    private void logMessage(String message) {
        try {
            Files.write(
                    Paths.get(logFileName),
                    ("Msg:" + message + "\n\n").getBytes(),
                    StandardOpenOption.APPEND
            );
        } catch (IOException e) {
            // Ignore
        }
    }

    public String getVersion() {
        if (VERSION != null) {
            return VERSION;
        }

        Properties props = new Properties();
        try {
            props.load(getClass().getResourceAsStream("/META-INF/maven/org.onestonesoup/packager/pom.properties"));
            VERSION = props.getProperty("version");
        } catch (Exception e) {
            VERSION = "Unknown";
        }

        return VERSION;
    }
}
