package org.onestonesoup.openforum.security.cookie;

import java.io.IOException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

import javax.xml.bind.DatatypeConverter;

import org.onestonesoup.core.data.EntityTree;
import org.onestonesoup.javascript.engine.JavascriptEngine;
import org.onestonesoup.openforum.controller.OpenForumController;
import org.onestonesoup.openforum.filemanager.FileServer;
import org.onestonesoup.openforum.security.Authenticator;
import org.onestonesoup.openforum.security.Login;
import org.onestonesoup.openforum.servlet.ClientConnectionInterface;
import org.onestonesoup.openforum.servlet.HttpHeader;
import org.onestonesoup.openforum.transaction.HttpRequestHelper;
import org.onestonesoup.openforum.transaction.HttpResponseHeader;

public class SessionCookieAuthenticator implements Authenticator {
	private static final String AUTHENTICATION_PAGE="/OpenForum/Authentication";
	private static final String LOGIN_SCRIPT_FILE="login.sjs";

	private OpenForumController controller;
	private SessionStore sessionStore;

	public Login authenticate(HttpHeader httpHeader) {
		String memberAlias = null;

		String sessionId = getSessionId(httpHeader);
		if(sessionId!=null) {
			memberAlias = sessionStore.authenticateUser(sessionId);
		}

		if (memberAlias == null) {
			return Login.getGuestLogin();
		}

		Login login = new Login(memberAlias, null);
		login.setLoggedIn(true);
		return login;
	}

	public boolean obtainAuthentication(HttpHeader httpHeader,
			ClientConnectionInterface connection) throws IOException {
		String request = httpHeader.getChild("request").getValue();

		if (request.equals("/OpenForum/Access/SignIn/Process")
				&& httpHeader.getChild("method").getValue().equals("post")) {
			if( signIn(httpHeader,connection) == true) {
				return true;
			}
		}
		if (request.equals("/OpenForum/Access/SignIn")
				&& httpHeader.getChild("method").getValue().equals("get")) {
			return true;
		} else {
			HttpResponseHeader responseHeader = new HttpResponseHeader(
					httpHeader, "text/html", 302, connection);
			responseHeader.addParameter("location", "/OpenForum/Access/SignIn?forwardTo="+request);

			connection.getOutputStream().flush();
			connection.close();

			return false;
		}
	}

	public void setController(OpenForumController controller) {
		this.controller = controller;
		sessionStore = SessionStore.getSessionStore(controller);
	}

	public void setFileServer(FileServer fileServer) {}

	// TODO move to core.StringHelper along with Base64
	private String generateMD5(String input) {
		MessageDigest MD5;
		try {
			MD5 = MessageDigest.getInstance("MD5");
			MD5.update(input.getBytes());
			byte[] hash = MD5.digest();
			return DatatypeConverter.printHexBinary(hash).toLowerCase();
		} catch (NoSuchAlgorithmException e) {
			e.printStackTrace();
		}
		return null;
	}

	// TODO belongs in a helper
	private void sendJSONResponse(EntityTree httpHeader,
			ClientConnectionInterface connection, String data, String sessionId)
			throws IOException {
		HttpResponseHeader responseHeader = new HttpResponseHeader(httpHeader,
				"application/json", 200, connection);
		if (sessionId != null) {
			responseHeader.addParameter("Set-Cookie", "openForumSession="
					+ sessionId + "; Path=/");

		}
		responseHeader.addParameter("content-length", "" + data.length());
		long modified = System.currentTimeMillis();
		responseHeader.addParameter("last-modified",
				HttpRequestHelper.getHttpDate(modified));
		responseHeader.addParameter("expires",
				HttpRequestHelper.getHttpDate(modified));
		responseHeader.addParameter("cache-control",
				" max-age=1, must-revalidate ");

		connection.getOutputStream().write(data.getBytes());
		connection.getOutputStream().flush();
	}

	protected SessionStore getSessionStore() {
		return sessionStore;
	}

	@Override
	public void signOut(HttpHeader httpHeader,ClientConnectionInterface connection) {
		String sessionId = getSessionId(httpHeader);
		if(sessionId != null) {
			sessionStore.invalidateSession(sessionId);
		}
	}

	@Override
	public boolean signIn(HttpHeader httpHeader,ClientConnectionInterface connection) throws IOException {
		/*String userId = httpHeader.getChild("parameters")
				.getChild("userId").getValue();
		String hash = httpHeader.getChild("parameters").getChild("hash")
				.getValue();
		String hashedPassword = httpHeader.getChild("parameters")
				.getChild("password").getValue();
		String flavour = httpHeader.getChild("parameters")
				.getChild("flavour").getValue();
		String password = null;
		try {
			password = controller.getFileManager()
					.getPageAttachmentAsString(
							"/OpenForum/Users/" + userId, "password.txt",
							controller.getSystemLogin());
		} catch (Exception e) {
			e.printStackTrace();
		}
		String testHashedPassword = generateMD5(password + hash);
		String sessionId = getSessionId(httpHeader);
		if(sessionId!=null) {
			sessionStore.invalidateSession(sessionId);
		}
		
		if (testHashedPassword.equals(hashedPassword)) {
			sessionId = sessionStore.createSession(userId);
		}

		if (sessionId != null) {
			if ("json".equals(flavour)) {
				sendJSONResponse(httpHeader, connection, "{result:\"ok\"}",
						sessionId);
			} else {
				HttpResponseHeader responseHeader = new HttpResponseHeader(
						httpHeader, "text/html", 302, connection);
				responseHeader.addParameter("Set-Cookie",
						"openForumSession=" + sessionId + "; Path=/");
				responseHeader.addParameter("location", "/SignedIn");
			}
			controller.getLogger().info(userId + " logged in.");
			return true;
		} else {
			controller.getLogger().info(userId + " failed to log in.");

			if ("json".equals(flavour)) {
				sendJSONResponse(
						httpHeader,
						connection,
						"{result:\"error\", errors:\"Sign In Failed. Incorrect user id / password combination.\"}",
						null);
			} else {
				HttpResponseHeader responseHeader = new HttpResponseHeader(
						httpHeader, "text/html", 302, connection);
				responseHeader
						.addParameter("location",
								"/OpenForum/Access/SignIn?errors=Sign In Failed. Incorrect user id / password combination.");
				return true;
			}
		}
		return false;*/


		String flavour = httpHeader.getChild("parameters")
				.getChild("flavour").getValue();
		String userId = httpHeader.getChild("parameters")
				.getChild("userId").getValue();
		String password = httpHeader.getChild("parameters")
				.getChild("password").getValue();
		Login login = new Login(userId,password);

		JavascriptEngine js = controller.getJavascriptEngine(controller.getSystemLogin());
		js.mount("httpHeader", httpHeader);
		js.mount("sessionStore", sessionStore);
		js.mount("login", login);
		js.mount("flavour", flavour);

		boolean booleanResult;
		try{
			String script = controller.getFileManager().getPageAttachmentAsString(AUTHENTICATION_PAGE, LOGIN_SCRIPT_FILE, controller.getSystemLogin());
			String result = js.runJavascript(AUTHENTICATION_PAGE + "/" + LOGIN_SCRIPT_FILE, script);
			booleanResult = Boolean.parseBoolean(result);
			login.setLoggedIn(booleanResult);
			login.clearPassword();

			if(booleanResult==true) {
				if ("json".equals(flavour)) {
					sendJSONResponse(httpHeader, connection, "{result:\"ok\"}",
							login.getSessionId());
				} else {
					HttpResponseHeader responseHeader = new HttpResponseHeader(
							httpHeader, "text/html", 302, connection);
					responseHeader.addParameter("Set-Cookie",
							"openForumSession=" + login.getSessionId() + "; Path=/");
					responseHeader.addParameter("location", "/SignedIn");
				}
				controller.getLogger().info(login.getUser()+" logged in.");
			} else {
				controller.getLogger().info(login.getUser()+" failed to log in.");
			}
		} catch(Throwable t) {
			throw new IOException(t);
		}

		return booleanResult;
	}
	
	private String getSessionId(HttpHeader httpHeader) {
		String sessionId = null;
		if (httpHeader.getChild("parameters").getChild("$cookie")
				.getChild("openForumSession") != null) {
			sessionId = httpHeader.getChild("parameters").getChild("$cookie")
					.getChild("openForumSession").getValue();
		}
		return sessionId;
	}
}
