package org.onestonesoup.openforum.security;

import java.io.IOException;

import org.onestonesoup.javascript.engine.JavascriptEngine;
import org.onestonesoup.openforum.controller.OpenForumController;

public class JavascriptAuthorizer implements Authorizer {

	private static final String AUTHORIZATION_PAGE="/OpenForum/Authorization";
	private static final String ACCESS_SCRIPT_FILE="access.sjs";
	
	private OpenForumController controller;
	
	public boolean isAuthorized(Login login, String pageName, String action) throws IOException {

		return checkAccess(login, pageName, null, action).isAllowed();
	}

	public boolean isAuthorized(Login login, String pageName, String fileName,
			String action) throws IOException {
		return checkAccess(login, pageName, fileName, action).isAllowed();
	}

	
	private AccessCheck checkAccess(Login login,String pageName, String fileName, String action) throws IOException
	{
		if(login==controller.getSystemLogin()) {
			AccessCheck check = new AccessCheck(login,pageName);
			check.setAllowed(true);
			return check;
		}
		JavascriptEngine js = controller.getJavascriptEngine(controller.getSystemLogin());
		js.mount("login", login);
		js.mount("pageName", pageName);
		js.mount("fileName", fileName);
		js.mount("action", action);
		try{
			String script = controller.getFileManager().getPageAttachmentAsString(AUTHORIZATION_PAGE, ACCESS_SCRIPT_FILE, controller.getSystemLogin());
			String result = js.runJavascript(AUTHORIZATION_PAGE + "/" + ACCESS_SCRIPT_FILE, script);
			AccessCheck check = new AccessCheck(login,pageName);
			check.setAllowed(Boolean.parseBoolean(result));
			
			return check;
		} catch(Throwable t) {
			throw new IOException(t);
		}
	}

	public void setController(OpenForumController controller) {
		this.controller = controller;
	}
}
