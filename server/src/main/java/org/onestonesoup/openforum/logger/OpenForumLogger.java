package org.onestonesoup.openforum.logger;

public interface OpenForumLogger {

	public abstract void error(String message);

	public abstract void info(String message);

	public abstract void warning(String message);
	
	public abstract void debug(String message);

	public abstract void test(String message);
}