package org.onestonesoup.openforum.controller;

import java.util.List;
import java.util.Map;

import org.onestonesoup.core.data.EntityTree;
import org.onestonesoup.core.data.KeyValuePair;
import org.onestonesoup.openforum.OpenForumException;
import org.onestonesoup.openforum.Stream;
import org.onestonesoup.openforum.security.AuthenticationException;
import org.onestonesoup.openforum.security.Login;

public interface OpenForumPageController extends OpenForum{

	public abstract void revert(String pageName, String version, Login login)
	throws AuthenticationException;

	public abstract long saveAsAttachment(String pageName, String fileName,
	byte[] data, Login login) throws Exception,
	AuthenticationException;

	public abstract long saveAsAttachment(String pageName, String fileName,
	Stream wikiStream, Login login) throws Exception,
	AuthenticationException;

	public abstract void savePage(String pageName, String updateTemplate,
	EntityTree.TreeEntity data, Login login) throws Exception,
	AuthenticationException;

	public abstract void savePage(String pageName, String source, String tags,
	EntityTree.TreeEntity postParameters, Login login) throws Exception,
	AuthenticationException;

	public abstract long getPageTimeStamp(String pageName) throws Exception,
	AuthenticationException;

	public abstract void delete(String pageName, Login login)
	throws Exception, AuthenticationException, OpenForumException;

	public abstract void delete(String pageName, String fileName, Login login)
	throws Exception, AuthenticationException;

	public abstract List<KeyValuePair> getDynamicPagesList() throws Exception;

	public abstract List<KeyValuePair> getParameterRedirectList() throws Exception;
	
	public abstract Map<String,String> getStandardTemplateData(String pageName,
	String title, String author, String timeStamp);

	public abstract void getRequiredTemplateInserts(String pageName,
	String template, Map<String,String> templateData);

	public abstract void addMissingPage(String missingPage, String sourcePage);

	public abstract void addToListPage(String listPageName, String pageName,Login login)
	throws Exception, AuthenticationException;

	public abstract void attachFile(String pageName, String fileName,
	String data, boolean backup) throws Exception,
	AuthenticationException;

	public abstract void copyAttachments(String sourcePageName,
	String pageName, Login login) throws Exception,
	AuthenticationException;

	public abstract void copyPage(String sourcePageName, String newPageName,
	String listPage, Login login) throws Exception,
	AuthenticationException;

	public abstract void createLinkFile(String sourcePageName, String pageName,
	String fileName, Login login) throws Exception,
	AuthenticationException;

}
