package org.onestonesoup.openforum.security;

import java.io.IOException;

import org.onestonesoup.openforum.controller.OpenForumController;

public interface Authorizer {
	String ACTION_CREATE = "create";
	String ACTION_READ = "read";
	String ACTION_UPDATE = "update";
	String ACTION_DELETE = "delete";

	public boolean isAuthorized(Login login,String pageName,String action) throws IOException;
	public boolean isAuthorized(Login login,String pageName,String fileName,String action) throws IOException;
	public void setController(OpenForumController controller);
}
