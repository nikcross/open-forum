package org.onestonesoup.openforum.javascript;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import org.onestonesoup.core.data.EntityTree;
import org.onestonesoup.javascript.engine.JavascriptEngine;
import org.onestonesoup.openforum.DataHelper;
import org.onestonesoup.openforum.OpenForumException;
import org.onestonesoup.openforum.OpenForumNameHelper;
import org.onestonesoup.openforum.TimeHelper;
import org.onestonesoup.openforum.controller.OpenForumController;
import org.onestonesoup.openforum.messagequeue.MessageQueue;
import org.onestonesoup.openforum.security.AuthenticationException;
import org.onestonesoup.openforum.security.Authorizer;
import org.onestonesoup.openforum.security.Login;
import org.onestonesoup.openforum.security.cookie.SessionCookieAuthenticator;
import org.onestonesoup.openforum.server.HttpHeader;
import org.onestonesoup.openforum.transaction.Transaction;

public class JavascriptOpenForumHelper {

	private OpenForumController controller;
	private Login login;
	private String version = null;

	public JavascriptOpenForumHelper(OpenForumController controller, Login login) {
		this.controller = controller;
		this.login = login;
	}

	public void addToListPage(String listPageName, String pageName)
			throws Exception, AuthenticationException {
		controller.addToListPage(listPageName, pageName, login);
	}

	public void addJournalEntry(String entry) throws Exception,
			AuthenticationException {
		controller.addJournalEntry(entry,login);
	}

	public String buildPage(String pageName) throws Exception,
			AuthenticationException {
		controller.markForRebuild();
		return controller.buildPage(pageName, false).toString();
	}

	public String buildPage(String pageName, boolean buildRefersTo)
			throws Exception, AuthenticationException {
		controller.markForRebuild();
		return controller.buildPage(pageName, buildRefersTo).toString();
	}

	public String buildPage(String pageName, String data, boolean isWikiData)
			throws Exception, AuthenticationException {
		return controller.buildPage(pageName, data, isWikiData).toString();
	}

	public String renderWikiData(String name, String data) throws Exception {
		return controller.renderWikiData(name, data);
	}

	public String buildPage(String name, String source) throws Exception {
		controller.markForRebuild();
		return controller.buildPage(name, source, false).toString();
	}

	public void refreshPage(String name) throws Exception {
		controller.buildPage(name, false);
	}

	public String[][] getPageAsList(String pageName) throws Exception {
		String source = controller.getFileManager().getPageSourceAsString(
				pageName, login);
		if (source == null) {
			return null;
		}
		return DataHelper.getPageAsList(source);
	}

	public Map<String, String> getPageAsTable(String pageName) throws Exception {
		String source = controller.getFileManager().getPageSourceAsString(
				pageName, login);
		return DataHelper.getPageAsTable(source);
	}

	// TODO Remove this and have Processor implement SystemAPI
	public JavascriptEngine getJavascriptEngine() {
		return controller.getJavascriptEngine(login);
	}

	public boolean pageExists(String pageName) throws Exception {
		return controller.getFileManager().pageExists(pageName, login);
	}

	public String getDateTimeStamp() {
		return TimeHelper.getDateTimeStamp(new Date());
	}

	public String getDateTimeStamp(String pageName) throws Exception,
			AuthenticationException {
		long ts = controller.getPageTimeStamp(pageName);
		return TimeHelper.getDateTimeStamp(new Date(ts));
	}

	public void deletePage(String pageName) throws Exception,
			AuthenticationException, OpenForumException {
		controller.delete(pageName, login);
		controller.markForRebuild();
	}

	@Deprecated
	// Use JavascriptFileHelper.deleteAttachment
	public void deleteAttachment(String pageName, String fileName)
			throws Exception, AuthenticationException {
		controller.delete(pageName, fileName, login);
		controller.markForRebuild();
	}

	public void revert(String pageName, String version)
			throws AuthenticationException {
		controller.revert(pageName, version, login);
		controller.markForRebuild();
	}

	public void copyPage(String sourcePageName, String newPageName,
			String listPageName) throws Exception, AuthenticationException {
		newPageName = OpenForumNameHelper.titleToWikiName(newPageName);
		controller.copyPage(sourcePageName, newPageName, listPageName, login);
		controller.markForRebuild();
	}

	@Deprecated
	// Use JavascriptFileHelper.saveAttachment
	public void saveAsAttachment(String pageName, String fileName, String data,
			String user) throws Exception, AuthenticationException {
		controller.saveAsAttachment(pageName, fileName, data.getBytes(), login);
		controller.markForRebuild();
	}

	public boolean rebuild() throws Exception, AuthenticationException {
		return rebuild(false);
	}

	public boolean rebuild(boolean force) throws Exception,
			AuthenticationException {
		if (force) {
			controller.markForRebuild();
		}
		return controller.rebuild();
	}

	public boolean userCanRead(String pageName) throws IOException {
		return controller.getAuthorizer().isAuthorized(login, pageName, Authorizer.ACTION_READ);
	}

	public boolean userCanUpdate(String pageName) throws IOException {
		return controller.getAuthorizer().isAuthorized(login, pageName, Authorizer.ACTION_UPDATE);
	}

	public boolean userCanDelete(String pageName) throws IOException {
		return controller.getAuthorizer().isAuthorized(login, pageName, Authorizer.ACTION_DELETE);
	}

	public boolean userCanGet(String pageName) throws IOException {
		return controller.getAuthorizer().isAuthorized(login, pageName, Authorizer.ACTION_GET);
	}

	public boolean userCanPost(String pageName) throws IOException {
		return controller.getAuthorizer().isAuthorized(login, pageName, Authorizer.ACTION_POST);
	}

	public void postMessageToQueue(String queueName, String message) throws AuthenticationException, IOException {
		if(!controller.getAuthorizer().isAuthorized(login, queueName, Authorizer.ACTION_UPDATE)) {
			throw new AuthenticationException("No update rights");
		}
		
		MessageQueue queue = controller.getQueueManager().getQueue(queueName);
		queue.postMessage(message, login.getUser().getName());
	}

	public String createQueue() {
		/* TODO
		if(!controller.getAuthorizer().isAuthorized(login, queueName, Authorizer.ACTION_READ)) {
			throw new AuthenticationException("No read rights");
		}
		*/
		
		String id = "queue." + controller.generateUniqueId();
		controller.getQueueManager().getQueue(id);

		return id;
	}

	public String[] findStoreKeys(String regex) throws IOException {
		String[] keys = controller.getStore().match(regex);
		List<String> allowedKeys = new ArrayList<String>();
		for(String key: keys) {
			if(controller.getAuthorizer().isAuthorized(login, key, Authorizer.ACTION_READ)) {
				allowedKeys.add(key);
			}
		}
		return allowedKeys.toArray(new String[]{});
	}
	
	public void storeValue(String key, String value) throws AuthenticationException, IOException {
		if(!controller.getAuthorizer().isAuthorized(login, key, Authorizer.ACTION_UPDATE)) {
			throw new AuthenticationException("No update rights");
		}
		
		controller.getStore().set(key, value);
	}

	public String retrieveValue(String key) throws IOException, AuthenticationException {
		if(!controller.getAuthorizer().isAuthorized(login, key, Authorizer.ACTION_READ)) {
			throw new AuthenticationException("No read rights");
		}
		
		Object value = controller.getStore().get(key);
		if( value!=null ) {
			return value.toString();
		} else {
			return null;
		}
	}

	public void storeObject(String key, Object object) throws AuthenticationException, IOException {
		if(!controller.getAuthorizer().isAuthorized(login, key, Authorizer.ACTION_UPDATE)) {
			throw new AuthenticationException("No update rights");
		}
		
		controller.getStore().set(key, object);
	}

	public Object retrieveObject(String key) throws IOException, AuthenticationException {
		if(!controller.getAuthorizer().isAuthorized(login, key, Authorizer.ACTION_READ)) {
			throw new AuthenticationException("No read rights");
		}
		
		try {
			return controller.getStore().get(key);
		} catch (NullPointerException npe) {
			return null;
		}
	}

	public Object removeObject(String key) throws IOException, AuthenticationException {
		if(!controller.getAuthorizer().isAuthorized(login, key, Authorizer.ACTION_DELETE)) {
			throw new AuthenticationException("No delete rights");
		}
		
		try {
			return controller.getStore().remove(key);
		} catch (NullPointerException npe) {
			return null;
		}
	}
	
	public String[] getMessagesSince(String queueName, String time) throws IOException, AuthenticationException {
		long timeStamp = Long.parseLong(time);

		if(!controller.getAuthorizer().isAuthorized(login, queueName, Authorizer.ACTION_READ)) {
			throw new AuthenticationException("No read rights");
		}
		
		MessageQueue queue = controller.getQueueManager().getQueue(queueName);

		List<String> list = new ArrayList<String>();
		EntityTree.TreeEntity messages = queue.getMessagesSince(timeStamp);
		for (int loop = 0; loop < messages.getChildren().size(); loop++) {
			EntityTree.TreeEntity message = messages.getChildren().get(loop);
			if (message.getName().equals("message")) {
				String owner = message.getAttribute("owner");
				if (owner == null || owner.length() == 0) {
					list.add(message.getValue().replaceAll("'", "\'"));
				} else {
					list.add(owner + ":"
							+ message.getValue().replaceAll("'", "\'"));
				}
			}
		}

		return list.toArray(new String[] {});
	}

	public String getMemberAliasForSessionId(String sessionId) {
		return ((SessionCookieAuthenticator)controller.getAuthenticator()).getMemberAlias(sessionId);
	}

	public void cleanUpQueues() {
		controller.getQueueManager().cleanUpQueues();
	}

	public long getTimeStamp() {
		return System.currentTimeMillis();
	}

	public String getVersion() {
		if (version != null) {
			return version;
		}
		try {
			Properties props = new Properties();
			props.load(this.getClass().getResourceAsStream("/META-INF/maven/org.onestonesoup/open-forum.server/pom.properties"));
			version = props.getProperty("version");
			
		} catch (Exception exception) {
			version = "Unknown";
		}
		return version;
	}

	public EntityTree getHttpServerStats() {
		return controller.getHttpServerStats();
	}

	public EntityTree getHttpsServerStats() {
		return controller.getHttpsServerStats();
	}

	public EntityTree getResourceStoreStats() {
		return controller.getResourceStoreStats();
	}

	public String validateWikiTitle(String title) {
		return OpenForumNameHelper.validateWikiTitle(title);
	}

	public String wikiToTitleName(String wikiName) {
		return OpenForumNameHelper.wikiNameToTitle(wikiName);
	}

	public String titleToWikiName(String title) {
		return OpenForumNameHelper.titleToWikiName(title);
	}

	public void setHomePage(String homePage) {
		controller.setHomePage(homePage);
	}

	public String generateUniqueId() {
		return controller.generateUniqueId();
	}

	public boolean signIn(Transaction transaction) throws IOException {
		return controller.getAuthenticator().signIn(
				(HttpHeader) transaction.getHttpHeader(),
				transaction.getConnection());
	}

	public void signOut(Transaction transaction) {
		controller.getAuthenticator().signOut(
				(HttpHeader) transaction.getHttpHeader(),
				transaction.getConnection());
	}
}
