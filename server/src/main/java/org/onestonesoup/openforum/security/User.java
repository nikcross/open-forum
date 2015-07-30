package org.onestonesoup.openforum.security;

public class User {

	private String name;

	public User(String userName) {
		this.name = userName;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

}
