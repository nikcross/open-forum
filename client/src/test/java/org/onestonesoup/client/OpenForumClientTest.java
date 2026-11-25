package org.onestonesoup.client;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import junit.framework.Test;
import junit.framework.TestCase;
import junit.framework.TestSuite;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;

/**
 * Unit test for simple App.
 */
public class OpenForumClientTest 
    extends TestCase
{
    /**
     * Create the test case
     *
     * @param testName name of the test case
     */
    public OpenForumClientTest( String testName )
    {
        super( testName );
    }

    /**
     * @return the suite of tests being tested
     */
    public static Test suite()
    {
        return new TestSuite( OpenForumClientTest.class );
    }

    /**
     * Rigourous Test :-)
     */
    public void testApp()
    {
        assertTrue( true );
    }

    public void testDownloadFileHandlesPageNameWithLeadingSlash() throws Exception {
        HttpServer server = startServer("/OpenForum/AddOn/Journal/page.content", 200, "=== Not in use ===\n");
        try {
            OpenForumClient client = new OpenForumClient(serverUrl(server), "SESSION=test");
            Path target = Files.createTempFile("journal-page", ".content");

            client.downloadFile("/OpenForum/AddOn/Journal", "page.content", target.toString());

            assertEquals("=== Not in use ===\n", new String(Files.readAllBytes(target), StandardCharsets.UTF_8));
        } finally {
            server.stop(0);
        }
    }

    public void testDownloadFileHandlesPageNameWithoutLeadingSlash() throws Exception {
        HttpServer server = startServer("/OpenForum/AddOn/Journal/page.content", 200, "=== Not in use ===\n");
        try {
            OpenForumClient client = new OpenForumClient(serverUrl(server), "SESSION=test");
            Path target = Files.createTempFile("journal-page", ".content");

            client.downloadFile("OpenForum/AddOn/Journal", "page.content", target.toString());

            assertEquals("=== Not in use ===\n", new String(Files.readAllBytes(target), StandardCharsets.UTF_8));
        } finally {
            server.stop(0);
        }
    }

    public void testDownloadFileRejectsHttpFailureWithoutOverwritingTarget() throws Exception {
        HttpServer server = startServer("/OpenForum/AddOn/Journal/page.content", 500, "server failed");
        try {
            OpenForumClient client = new OpenForumClient(serverUrl(server), "SESSION=test");
            Path target = Files.createTempFile("journal-page", ".content");
            Files.write(target, "existing".getBytes(StandardCharsets.UTF_8));

            try {
                client.downloadFile("OpenForum/AddOn/Journal", "page.content", target.toString());
                fail("Expected download failure");
            } catch (IOException e) {
                assertTrue(e.getMessage().contains("HTTP 500"));
            }

            assertEquals("existing", new String(Files.readAllBytes(target), StandardCharsets.UTF_8));
        } finally {
            server.stop(0);
        }
    }

    public void testDownloadFileRejectsOpenForumErrorMarkerWithoutOverwritingTarget() throws Exception {
        HttpServer server = startServer("/OpenForum/AddOn/Journal/page.content", 200, "/OpenForum/ErrorPages/500");
        try {
            OpenForumClient client = new OpenForumClient(serverUrl(server), "SESSION=test");
            Path target = Files.createTempFile("journal-page", ".content");
            Files.write(target, "existing".getBytes(StandardCharsets.UTF_8));

            try {
                client.downloadFile("OpenForum/AddOn/Journal", "page.content", target.toString());
                fail("Expected OpenForum error marker failure");
            } catch (IOException e) {
                assertTrue(e.getMessage().contains("/OpenForum/ErrorPages/500"));
            }

            assertEquals("existing", new String(Files.readAllBytes(target), StandardCharsets.UTF_8));
        } finally {
            server.stop(0);
        }
    }

    private HttpServer startServer(String path, int status, String body) throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress(InetAddress.getLoopbackAddress(), 0), 0);
        server.createContext(path, exchange -> send(exchange, status, body));
        server.start();
        return server;
    }

    private void send(HttpExchange exchange, int status, String body) throws IOException {
        byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
        exchange.sendResponseHeaders(status, bytes.length);
        try (OutputStream output = exchange.getResponseBody()) {
            output.write(bytes);
        }
    }

    private String serverUrl(HttpServer server) {
        return "http://" + server.getAddress().getHostString() + ":" + server.getAddress().getPort() + "/";
    }
}
