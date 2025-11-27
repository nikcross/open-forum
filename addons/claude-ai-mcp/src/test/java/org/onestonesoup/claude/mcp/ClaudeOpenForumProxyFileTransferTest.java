package org.onestonesoup.claude.mcp;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.onestonesoup.javascript.engine.JSON;
import org.onestonesoup.javascript.engine.JavascriptEngine;
import org.mozilla.javascript.NativeArray;
import org.mozilla.javascript.NativeObject;
import org.mozilla.javascript.Undefined;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class ClaudeOpenForumProxyFileTransferTest {

    @Test
    @DisplayName("Downloads attachment to default directory when directive omits local path")
    void testDownloadsFileUsingDefaultDirectory() throws Throwable {
        //Given
        // Proxy configured with mock client and default download cache
        RecordingClient client = new RecordingClient();
        client.response = buildServerResponse(
                rpcResultWithTransfer("download", null, "/Docs/Notes", "readme.md")
        );
        Path tempLog = Files.createTempFile("proxy-log", ".txt");
        Path tempDownloads = Files.createTempDirectory("openforum-downloads");
        ClaudeOpenForumProxy proxy = new ClaudeOpenForumProxy(client, "/OpenForum/AddOn/ClaudeMCP", tempLog, tempDownloads);

        //When
        // File-transfer directive is processed through the proxy
        String payload = proxy.handleRequest("{\"jsonrpc\":\"2.0\"}");

        //Then
        // Destination path is resolved under default folder and response content updated
        assertEquals(1, client.downloadDestinations.size(), "Expected a download to be initiated");
        Path expected = tempDownloads.resolve("Docs_Notes").resolve("readme.md");
        assertEquals(expected.toString(), client.downloadDestinations.get(0));

        JSON json = new JSON(JavascriptEngine.getInstance());
        NativeObject data = (NativeObject) json.parse(payload);
        NativeObject result = (NativeObject) data.get("result");
        assertTrue(result.get("fileTransfers") == null || result.get("fileTransfers") instanceof Undefined,
                "Proxy should strip file transfer instructions before returning payload");

        NativeArray content = (NativeArray) result.get("content");
        assertEquals(2, content.getLength(), "Expected directive entry to be rewritten, leaving array size intact");
        NativeObject summary = (NativeObject) content.get(1, content);
        assertTrue(summary.get("text").toString().contains("Downloaded"),
                "Summary text should describe download result");
    }

    @Test
    @DisplayName("Uploads local file when directive supplies absolute path")
    void testUploadsFileUsingProvidedPath() throws Throwable {
        //Given
        // Proxy pointed at mock client and temporary upload source file
        RecordingClient client = new RecordingClient();
        Path sourceFile = Files.createTempFile("upload-source", ".txt");
        Files.write(sourceFile, "sample".getBytes());
        client.response = buildServerResponse(
                rpcResultWithTransfer("upload", sourceFile.toString(), "/Docs/Notes", "artifact.bin")
        );
        Path tempLog = Files.createTempFile("proxy-log", ".txt");
        Path tempDownloads = Files.createTempDirectory("openforum-downloads");
        ClaudeOpenForumProxy proxy = new ClaudeOpenForumProxy(client, "/OpenForum/AddOn/ClaudeMCP", tempLog, tempDownloads);

        //When
        // Upload directive is handled via proxy
        String payload = proxy.handleRequest("{\"jsonrpc\":\"2.0\"}");

        //Then
        // Client receives correct source path and proxy response reflects upload
        assertEquals(1, client.uploadSources.size(), "Expected an upload to be initiated");
        assertEquals(sourceFile.toAbsolutePath().normalize().toString(), client.uploadSources.get(0));
        assertTrue(payload.contains("Uploaded"), "Proxy response should include upload summary text");
    }

    private String buildServerResponse(String dataPayload) {
        return "{\"result\":\"ok\",\"message\":\"Performed action handleRequest\",\"data\":" + dataPayload + "}";
    }

    private String rpcResultWithTransfer(String direction, String localPath, String pageName, String fileName) {
        StringBuilder builder = new StringBuilder();
        builder.append("{\"jsonrpc\":\"2.0\",\"id\":1,\"result\":{\"content\":[{\"type\":\"text\",\"text\":\"start\"},{\"type\":\"text\",\"text\":");
        String directiveJson = "{\"directive\":\"file-transfer\",\"direction\":\"" + direction + "\",\"pageName\":\"" + pageName + "\",\"fileName\":\"" + fileName + "\"";
        if (localPath != null) {
            directiveJson += ",\"localPath\":\"" + localPath + "\"";
        }
        directiveJson += "}";
        builder.append("\"").append(escape(directiveJson)).append("\"");
        builder.append("}]}}");
        return builder.toString();
    }

    private String escape(String value) {
        return value
                .replace("\\", "\\\\")
                .replace("\"", "\\\"");
    }

    private static class RecordingClient implements ClaudeServerClient {
        String response;
        String getResponse = "{}";
        final List<String> downloadDestinations = new ArrayList<>();
        final List<String> uploadSources = new ArrayList<>();

        @Override
        public String doPost(String pageName, Map<String, String> params) {
            return response;
        }

        @Override
        public String doGet(String pageName) {
            return getResponse;
        }

        @Override
        public void downloadFile(String pageName, String fileName, String localFileName) {
            downloadDestinations.add(localFileName);
        }

        @Override
        public String uploadFile(String pageName, String fileName, String localFileName) {
            uploadSources.add(localFileName);
            return "{\"result\":\"ok\"}";
        }
    }
}
