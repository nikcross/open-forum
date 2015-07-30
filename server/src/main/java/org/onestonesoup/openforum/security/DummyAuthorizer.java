package org.onestonesoup.openforum.security;

import org.onestonesoup.openforum.controller.OpenForumController;

public class DummyAuthorizer implements Authorizer {

	public void setController(OpenForumController controller) {	}

	public boolean isAuthorized(Login login, String pageName, String action) {
		return true;
	}

	public boolean isAuthorized(Login login, String pageName, String fileName,
			String action) {
		return true;
	}

}
