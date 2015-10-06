package org.onestonesoup.openforum.security.cookie;

import org.onestonesoup.openforum.plugin.SystemAPI;

public class SessionStoreView extends SystemAPI {

	private boolean hasCookieAuthentication() {
		return (getController().getAuthenticator() instanceof SessionCookieAuthenticator);
	}
	
	private SessionStore getSessionStore() {
		return ((SessionCookieAuthenticator)getController().getAuthenticator()).getSessionStore();
	}
	
	public String[] getUsersOnline() {
		if(hasCookieAuthentication()==false) {
			return null;
		}
		return getSessionStore().getUsersOnline().toArray(new String[]{});
	}
}
