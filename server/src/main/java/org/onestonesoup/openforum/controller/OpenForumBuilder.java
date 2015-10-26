package org.onestonesoup.openforum.controller;

import org.onestonesoup.openforum.security.AuthenticationException;
import org.onestonesoup.openforum.security.Login;

public interface OpenForumBuilder extends OpenForum{

	public abstract StringBuffer buildPage(String name) throws Exception,
	AuthenticationException;

	public abstract StringBuffer buildPage(String name, boolean buildRefersTo)
	throws Exception, AuthenticationException;

	public abstract StringBuffer buildPage(String name, String data,
	boolean isWikiContent) throws Exception, AuthenticationException;

	public abstract String getAliasLink(String name) throws Exception;

	public abstract String renderWikiData(String name,String data) throws Exception,AuthenticationException;

}
