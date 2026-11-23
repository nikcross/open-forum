package org.onestonesoup.openforum.router;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNull;

import java.util.HashMap;
import java.util.Map;

import org.junit.Test;
import org.onestonesoup.openforum.controller.OpenForumController;
import org.onestonesoup.openforum.filemanager.FileManager;
import org.onestonesoup.openforum.server.HttpHeader;

public class HttpsRedirectTest {

	private static class RecordingConnection extends TestClientConnection {
		private final Map<String, String> headers = new HashMap<String, String>();
		private int status;

		@Override
		public void addResponseHeader(String name, String value) {
			headers.put(name, value);
		}

		@Override
		public void setResponseStatus(int code) {
			status = code;
		}
	}

	@Test
	public void shouldBeOffUnlessSet() throws Throwable {
		assertFalse(new OpenForumController("", "").isSecure());
	}

	@Test
	public void shouldRedirectHttpKeepingHostPathAndQuery() throws Throwable {
		RecordingConnection connection = route(true, "false", "/A Page", "/A%20Page?cat=christmas&x=%26");

		assertEquals(301, connection.status);
		assertEquals("https://example.com/A%20Page?cat=christmas&x=%26", connection.headers.get("location"));
	}

	@Test
	public void shouldNotRedirectHttps() throws Throwable {
		assertNull(route(true, "true", "/Page", "/Page").headers.get("location"));
	}

	@Test
	public void shouldNotRedirectHttpWhenNotSecure() throws Throwable {
		assertNull(route(false, "false", "/Page", "/Page").headers.get("location"));
	}

	private RecordingConnection route(boolean controllerSecure, String requestSecure, String request, String rawUri) throws Throwable {
		OpenForumController controller = new OpenForumController("", "");
		controller.setFileManager(new FileManager(null, null, null));
		controller.setSecure(controllerSecure);

		HttpHeader httpHeader = new HttpHeader();
		httpHeader.addChild("request").setValue(request);
		httpHeader.addChild("rawUri").setValue(rawUri);
		httpHeader.addChild("method").setValue("get");
		httpHeader.addChild("host").setValue("example.com");
		httpHeader.addChild("secure").setValue(requestSecure);
		httpHeader.addChild("parameters");

		RecordingConnection connection = new RecordingConnection();
		try {
			new Router("test", controller).route(connection, httpHeader);
		} catch (Throwable afterRedirectCheck) {
			// With no site content the router cannot serve a page; only the redirect matters here
		}
		return connection;
	}
}
