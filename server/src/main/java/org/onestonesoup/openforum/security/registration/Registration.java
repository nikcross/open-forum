package org.onestonesoup.openforum.security.registration;

public interface Registration {
	public String[] checkAvailability(String emailAddress,String alias,String firstName,String secondName) throws Throwable;
	public abstract boolean memberAvailable(String alias,String emailAddress) throws Throwable;
	public abstract String confirmRegistration(String confirmationString,String password) throws Throwable;
	public abstract void registerUser(String host,String emailAddress,String alias,String firstName,String secondName) throws Throwable;
	public abstract boolean retrievePassword(String emailAddress) throws Throwable;
}
