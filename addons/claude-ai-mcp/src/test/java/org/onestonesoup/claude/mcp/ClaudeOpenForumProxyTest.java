package org.onestonesoup.claude.mcp;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

//@Disabled
public class ClaudeOpenForumProxyTest {

    private String remoteHost;
    private String remotePageName;
    private String userId;
    private String password;
    private boolean hashedPassword = true;

    @BeforeEach
    public void setUp() {
        // Configuration for remote server test
        remoteHost = System.getProperty("openforum.host", "http://localhost:8888");
        remotePageName = System.getProperty("openforum.page", "OpenForum/AddOn/ClaudeMCP");
        userId = System.getProperty("openforum.user", "Admin");
        password = System.getProperty("openforum.password", "1234");
        hashedPassword = Boolean.parseBoolean( System.getProperty("openforum.hashedPassword", "true") );
    }

    @Test
    @DisplayName("Creates proxy instance with valid remote server configuration")
    public void testCreatesProxyWithValidConfiguration() throws Exception {
        //Given
        // Valid remote server credentials and page name are configured

        //When
        // A new ClaudeOpenForumProxy is instantiated with the remote server details
        ClaudeOpenForumProxy proxy = new ClaudeOpenForumProxy(
            remoteHost,
            remotePageName,
            userId,
            password,
                hashedPassword
        );

        //Then
        // The proxy instance is created successfully and has a version
        assertNotNull(proxy, "Proxy instance should be created");
        assertNotNull(proxy.getVersion(), "Proxy version should not be null");
    }

    @Test
    @DisplayName("Handles MCP initialize request with remote server")
    public void testHandlesMcpInitializeRequest() throws Throwable {
        //Given
        // A proxy connected to the remote OpenForum MCP server
        ClaudeOpenForumProxy proxy = new ClaudeOpenForumProxy(
            remoteHost,
            remotePageName,
            userId,
            password,
                hashedPassword
        );
        String initRequest = buildInitializeRequest();

        //When
        // An MCP initialize request is sent to the remote server
        String response = proxy.handleRequest(initRequest);

        //Then
        // A valid JSON response is returned from the server
        assertNotNull(response, "Response should not be null");
        assertTrue(response.contains("jsonrpc") || response.contains("result"),
            "Response should contain MCP protocol fields");
    }

    @Test
    @DisplayName("Handles MCP tools/list request with remote server")
    public void testHandlesToolsListRequest() throws Throwable {
        //Given
        // A proxy connected to the remote OpenForum MCP server
        ClaudeOpenForumProxy proxy = new ClaudeOpenForumProxy(
            remoteHost,
            remotePageName,
            userId,
            password,
                hashedPassword
        );
        String toolsListRequest = buildToolsListRequest();

        //When
        // An MCP tools/list request is sent to the remote server
        String response = proxy.handleRequest(toolsListRequest);

        //Then
        // A response containing tools information is returned
        assertNotNull(response, "Response should not be null");
        assertTrue(response.contains("jsonrpc") || response.contains("tools"),
            "Response should contain tools information");
    }

    @Test
    @DisplayName("Handles MCP resources/list request with remote server")
    public void testHandlesResourcesListRequest() throws Throwable {
        //Given
        // A proxy connected to the remote OpenForum MCP server
        ClaudeOpenForumProxy proxy = new ClaudeOpenForumProxy(
            remoteHost,
            remotePageName,
            userId,
            password,
                hashedPassword
        );
        String resourcesListRequest = buildResourcesListRequest();

        //When
        // An MCP resources/list request is sent to the remote server
        String response = proxy.handleRequest(resourcesListRequest);

        //Then
        // A response containing resources information is returned
        assertNotNull(response, "Response should not be null");
        assertTrue(response.contains("jsonrpc") || response.contains("resources"),
            "Response should contain resources information");
    }

    @Test
    @DisplayName("Returns null for notification requests")
    public void testReturnsNullForNotifications() throws Throwable {
        //Given
        // A proxy connected to the remote server and a notification request
        ClaudeOpenForumProxy proxy = new ClaudeOpenForumProxy(
            remoteHost,
            remotePageName,
            userId,
            password,
            hashedPassword
        );
        String notificationRequest = buildNotificationRequest();

        //When
        // A notification request (expecting "ok" response) is sent
        String response = proxy.handleRequest(notificationRequest);

        //Then
        // No response is returned (null) as per MCP notification protocol
        assertNull(response, "Notification requests should return null");
    }

    // Helper methods to build MCP protocol requests

    private String buildInitializeRequest() {
        return "{"
            + "\"jsonrpc\":\"2.0\","
            + "\"id\":1,"
            + "\"method\":\"initialize\","
            + "\"params\":{"
            + "\"protocolVersion\":\"2024-11-05\","
            + "\"capabilities\":{},"
            + "\"clientInfo\":{\"name\":\"test-client\",\"version\":\"1.0.0\"}"
            + "}"
            + "}";
    }

    private String buildToolsListRequest() {
        return "{"
            + "\"jsonrpc\":\"2.0\","
            + "\"id\":2,"
            + "\"method\":\"tools/list\""
            + "}";
    }

    private String buildResourcesListRequest() {
        return "{"
            + "\"jsonrpc\":\"2.0\","
            + "\"id\":3,"
            + "\"method\":\"resources/list\""
            + "}";
    }

    private String buildNotificationRequest() {
        return "{"
            + "\"jsonrpc\":\"2.0\","
            + "\"method\":\"notifications/initialized\""
            + "}";
    }
}
