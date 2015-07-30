package org.onestonesoup.openforum.controller;

import org.onestonesoup.openforum.security.Authenticator;
import org.onestonesoup.openforum.security.Authorizer;

public interface OpenForumSecurity {
	public Authenticator getAuthenticator();
	public Authorizer getAuthorizer();
}
