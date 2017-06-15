package org.onestonesoup.openforum.security;

public class Login {
	private static Login GUEST_LOGIN = new Login("Guest", "");
	private String password;
	private String sessionId;
	private User user;
	private boolean loggedIn = false;

	public static Login getGuestLogin() {
		GUEST_LOGIN.setLoggedIn(true);
		return GUEST_LOGIN;
	}

	public Login(String userName, String password) {
		this.password = password;
		this.user = new User(userName);
	}

	public Login() {
	}

	public User getUser() {
		return this.user;
	}

	public void setLoggedIn(boolean state) {
		this.loggedIn = state;
	}

	public boolean isLoggedIn() {
		return this.loggedIn;
	}

	public void setUser(User user) {
		this.user = user;
	}

	public String getPassword() {
		return this.password;
	}

	public void clearPassword() {
		this.password = null;
	}

	public String getSessionId() {
		return this.sessionId;
	}

	public void setSessionId(String sessionId) {
		this.sessionId = sessionId;
	}
}
