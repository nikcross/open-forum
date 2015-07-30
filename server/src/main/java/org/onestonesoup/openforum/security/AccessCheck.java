package org.onestonesoup.openforum.security;


public class AccessCheck {

	private Login login;
	private String request;
	private boolean allowed = false;
	
	public AccessCheck(Login login, String request) {
		this.login = login;
		this.request = request;
	}

	public boolean isAllowed() {
		return allowed;
	}

	public void setAllowed(boolean allowed) {
		this.allowed = allowed;
	}

	public Login getLogin() {
		return login;
	}

	public String getRequest() {
		return request;
	}
}
