package org.onestonesoup.openforum.security.cookie;

import java.io.IOException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import org.onestonesoup.core.data.EntityTree;
import org.onestonesoup.javascript.engine.JavascriptEngine;
import org.onestonesoup.openforum.controller.OpenForumController;
import org.onestonesoup.openforum.filemanager.FileServer;
import org.onestonesoup.openforum.javascript.JavascriptHelper;
import org.onestonesoup.openforum.security.Authenticator;
import org.onestonesoup.openforum.security.Login;
import org.onestonesoup.openforum.server.ClientConnectionInterface;
import org.onestonesoup.openforum.server.HttpHeader;
import org.onestonesoup.openforum.transaction.HttpRequestHelper;
import org.onestonesoup.openforum.transaction.HttpResponseHeader;

public class SessionCookieAuthenticator implements Authenticator {
	private static final String AUTHENTICATION_PAGE = "/OpenForum/Authentication";
	private static final String LOGIN_SCRIPT_FILE = "login.sjs";
	private OpenForumController controller;
	private SessionStore sessionStore;

	public SessionCookieAuthenticator() {
	}

	public String getMemberAlias(String sessionId) {
		return this.sessionStore.authenticateUser(sessionId);
	}

	public Login authenticate(HttpHeader httpHeader) {
		String memberAlias = null;
		String sessionId = this.getSessionId(httpHeader);
		if(sessionId != null) {
			memberAlias = this.sessionStore.authenticateUser(sessionId);
		}

		if(memberAlias == null) {
			return Login.getGuestLogin();
		} else {
			Login login = new Login(memberAlias, (String)null);
			login.setLoggedIn(true);
			login.setSessionId(sessionId);
			return login;
		}
	}

	public boolean obtainAuthentication(HttpHeader httpHeader, ClientConnectionInterface connection) throws IOException {
		String request = httpHeader.getChild("request").getValue();
		if(request.equals("/OpenForum/Access/SignIn/Process") && httpHeader.getChild("method").getValue().equals("post") && this.signIn(httpHeader, connection)) {
			return true;
		} else if(request.equals("/OpenForum/Access/SignIn") && httpHeader.getChild("method").getValue().equals("get")) {
			return true;
		} else {
			HttpResponseHeader responseHeader = new HttpResponseHeader(httpHeader, "text/html", 302, connection);
			responseHeader.addParameter("location", "/OpenForum/Access/SignIn?forwardTo=" + request);
			connection.sendEmpty();
			return false;
		}
	}

	public void setController(OpenForumController controller) {
		this.controller = controller;
		this.sessionStore = SessionStore.getSessionStore(controller);
	}

	public void setFileServer(FileServer fileServer) {
	}


	private String generateMD5(String input) {
		try {
			MessageDigest MD5 = MessageDigest.getInstance("MD5");
			MD5.update(input.getBytes());
			byte[] hash = MD5.digest();
			return JavascriptHelper.bytesToHex(hash);
		} catch (NoSuchAlgorithmException var4) {
			var4.printStackTrace();
			return null;
		}
	}

	private void sendJSONResponse(EntityTree httpHeader, ClientConnectionInterface connection, String data, String sessionId) throws IOException {
		HttpResponseHeader responseHeader = new HttpResponseHeader(httpHeader, "application/json", 200, connection);
		if(sessionId != null) {
			responseHeader.addParameter("Set-Cookie", "openForumSession=" + sessionId + "; Path=/");
		}

		long modified = System.currentTimeMillis();
		responseHeader.addParameter("last-modified", HttpRequestHelper.getHttpDate(modified));
		responseHeader.addParameter("expires", HttpRequestHelper.getHttpDate(modified));
		responseHeader.addParameter("cache-control", " max-age=1, must-revalidate ");
		connection.send(data);
	}

	protected SessionStore getSessionStore() {
		return this.sessionStore;
	}

	public void signOut(HttpHeader httpHeader, ClientConnectionInterface connection) {
		String sessionId = this.getSessionId(httpHeader);
		if(sessionId != null) {
			this.sessionStore.invalidateSession(sessionId);
		}

	}

	public boolean signIn(HttpHeader httpHeader, ClientConnectionInterface connection) throws IOException {
		String flavour = httpHeader.getChild("parameters").getChild("flavour").getValue();
		String userId = httpHeader.getChild("parameters").getChild("userId").getValue();
		String password = httpHeader.getChild("parameters").getChild("password").getValue();
		Login login = new Login(userId, password);
		JavascriptEngine js = this.controller.getJavascriptEngine(this.controller.getSystemLogin());
		js.mount("httpHeader", httpHeader);
		js.mount("sessionStore", this.sessionStore);
		js.mount("login", login);
		js.mount("flavour", flavour);

		try {
			String script = this.controller.getFileManager().getPageAttachmentAsString("/OpenForum/Authentication", "login.sjs", this.controller.getSystemLogin());
			String result = js.runJavascript("/OpenForum/Authentication/login.sjs", script);
			boolean booleanResult = Boolean.parseBoolean(result);
			login.setLoggedIn(booleanResult);
			login.clearPassword();
			HttpResponseHeader responseHeader;
			if(booleanResult) {
				if("json".equals(flavour)) {
					this.sendJSONResponse(httpHeader, connection, "{result:\"ok\"}", login.getSessionId());
				} else {
					responseHeader = new HttpResponseHeader(httpHeader, "text/html", 302, connection);
					responseHeader.addParameter("Set-Cookie", "openForumSession=" + login.getSessionId() + "; Path=/");
					responseHeader.addParameter("location", "/OpenForum/Access/SignedIn?message=Signed in as " + userId);
				}

				this.controller.getLogger().info(login.getUser() + " logged in.");
			} else {
				if("json".equals(flavour)) {
					this.sendJSONResponse(httpHeader, connection, "{result:\"error\"}", login.getSessionId());
				} else {
					responseHeader = new HttpResponseHeader(httpHeader, "text/html", 302, connection);
					responseHeader.addParameter("Set-Cookie", "openForumSession=" + login.getSessionId() + "; Path=/");
					responseHeader.addParameter("location", "/OpenForum/Access/SignIn?message=Sign in failed for " + userId);
				}

				this.controller.getLogger().info(login.getUser() + " failed to log in.");
			}

			return true;
		} catch (Throwable var12) {
			throw new IOException(var12);
		}
	}

	private String getSessionId(HttpHeader httpHeader) {
		String sessionId = null;
		if(httpHeader.getChild("parameters").getChild("$cookie").getChild("openForumSession") != null) {
			sessionId = httpHeader.getChild("parameters").getChild("$cookie").getChild("openForumSession").getValue();
		}

		return sessionId;
	}
}