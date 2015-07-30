package org.onestonesoup.openforum.controller;

public interface OpenForumScripting {

	public String startJavascript() throws Throwable;
	
	public void runScript(String scriptId);
}
