package org.onestonesoup.openforum.security;


public class Login {

	private static Login GUEST_LOGIN = new Login("Guest","");
	
	public static Login getGuestLogin() {
		GUEST_LOGIN.setLoggedIn(true);
		return GUEST_LOGIN;
	}
	
	private String password;
	private User user;
	private boolean loggedIn = false;
	
	public Login(String userName, String password) {
		this.password = password;
		user = new User(userName);
	}

	public Login() {
	}

	public User getUser() {
		return user;
	}

	public void setLoggedIn(boolean state) {
		this.loggedIn = state;
	}

	public boolean isLoggedIn() {
		return loggedIn;
	}

	public void setUser(User user) {
		this.user = user;
	}

	public String getPassword() {
		return password;
	}
	
	public void clearPassword() {
		password = null;
	}
}
