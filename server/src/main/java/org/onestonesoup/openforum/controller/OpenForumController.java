package org.onestonesoup.openforum.controller;

import static org.onestonesoup.openforum.controller.OpenForumConstants.CONTENT_FILE;
import static org.onestonesoup.openforum.controller.OpenForumConstants.DEFAULT_HOME_PAGE_PATH;
import static org.onestonesoup.openforum.controller.OpenForumConstants.EDIT_LINK_DISPLAY_TEMPLATE;
import static org.onestonesoup.openforum.controller.OpenForumConstants.EDIT_PAGE;
import static org.onestonesoup.openforum.controller.OpenForumConstants.INDEX_FILE;
import static org.onestonesoup.openforum.controller.OpenForumConstants.JOURNAL_PAGE_PATH;
import static org.onestonesoup.openforum.controller.OpenForumConstants.LINKS_FILE;
import static org.onestonesoup.openforum.controller.OpenForumConstants.MISSING_PAGES_PATH;
import static org.onestonesoup.openforum.controller.OpenForumConstants.OPEN_FORUM_ALIASES;
import static org.onestonesoup.openforum.controller.OpenForumConstants.OPEN_FORUM_DEFAULT_PAGE_PATH;
import static org.onestonesoup.openforum.controller.OpenForumConstants.OPEN_FORUM_DYNAMIC_PAGES;
import static org.onestonesoup.openforum.controller.OpenForumConstants.OPEN_FORUM_PARAMETER_REDIRECT_LIST;
import static org.onestonesoup.openforum.controller.OpenForumConstants.OWNER_FILE;
import static org.onestonesoup.openforum.controller.OpenForumConstants.PAGES_INDEX_PAGE_PATH;
import static org.onestonesoup.openforum.controller.OpenForumConstants.PAGE_BUILD_JS;
import static org.onestonesoup.openforum.controller.OpenForumConstants.PAGE_FILE;
import static org.onestonesoup.openforum.controller.OpenForumConstants.TAGS_FILE;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.onestonesoup.core.ExceptionHelper;
import org.onestonesoup.core.StringHelper;
import org.onestonesoup.core.data.EntityTree;
import org.onestonesoup.core.data.KeyValuePair;
import org.onestonesoup.core.data.XmlHelper;
import org.onestonesoup.javascript.engine.JSON;
import org.onestonesoup.javascript.engine.JavascriptEngine;
import org.onestonesoup.openforum.DataHelper;
import org.onestonesoup.openforum.KeyValueListPage;
import org.onestonesoup.openforum.OpenForumException;
import org.onestonesoup.openforum.OpenForumNameHelper;
import org.onestonesoup.openforum.Renderer;
import org.onestonesoup.openforum.Stream;
import org.onestonesoup.openforum.TimeHelper;
import org.onestonesoup.openforum.filemanager.FileManager;
import org.onestonesoup.openforum.filemanager.LocalDriveResourceStore;
import org.onestonesoup.openforum.filemanager.ResourceStoreProxy;
import org.onestonesoup.openforum.javascript.JavascriptExternalResourceHelper;
import org.onestonesoup.openforum.javascript.JavascriptFileHelper;
import org.onestonesoup.openforum.javascript.JavascriptHelper;
import org.onestonesoup.openforum.javascript.JavascriptOpenForumHelper;
import org.onestonesoup.openforum.logger.DefaultOpenForumLogger;
import org.onestonesoup.openforum.logger.OpenForumLogger;
import org.onestonesoup.openforum.messagequeue.MessageQueueManager;
import org.onestonesoup.openforum.plugin.PluginManager;
import org.onestonesoup.openforum.renderers.WikiLinkParser;
import org.onestonesoup.openforum.router.Router;
import org.onestonesoup.openforum.security.AuthenticationException;
import org.onestonesoup.openforum.security.Authenticator;
import org.onestonesoup.openforum.security.Authorizer;
import org.onestonesoup.openforum.security.DummyAuthenticator;
import org.onestonesoup.openforum.security.DummyAuthorizer;
import org.onestonesoup.openforum.security.Login;
import org.onestonesoup.openforum.store.Store;
import org.onestonesoup.openforum.trigger.PageChangeTrigger;
import org.onestonesoup.openforum.trigger.RebuildTrigger;
import org.onestonesoup.openforum.trigger.StartUpTrigger;
import org.onestonesoup.openforum.trigger.TimerTrigger;
import org.onestonesoup.openforum.versioncontrol.DefaultVersionController;

public class OpenForumController implements OpenForumScripting,
		OpenForumBuilder, OpenForumPageController, OpenForumSecurity {

	private long ID_COUNTER = 1;
	private static final String EXCLUDE_REFERENCES = "exclude-references.txt";

	private List<OpenForumBuilderListener> listeners = new ArrayList<OpenForumBuilderListener>();

	private Router router;

	private Map<String, String> reserved = new HashMap<String, String>();

	private Map<String, String> missingPages = new HashMap<String, String>();
	private Map<String, String> externalLinks = new HashMap<String, String>();

	private long lastBuildTimeStamp;
	private boolean building = false;
	private boolean markedForRebuild = true;

	private String domainName;
	private FileManager fileManager;
	private PluginManager pluginManager;
	private Login systemLogin = new Login("System", "");

	private RebuildTrigger rebuildTrigger;
	@SuppressWarnings("unused")
	private TimerTrigger timerTrigger;
	private PageChangeTrigger pageChangeTrigger;

	private MessageQueueManager queueManager;
	private Store store = new Store();
	private KeyValueListPage dynamicPages;
	private KeyValueListPage parameterRedirectList;
	private KeyValueListPage aliasList;
	private Map<String, String> mimeTypes = new HashMap<String, String>();

	private String homePage = DEFAULT_HOME_PAGE_PATH;

	private boolean initialised = false;
	private Authenticator authenticator;
	private Authorizer authorizer;
	private boolean secure = true;

	private OpenForumLogger logger;

	private FileManager initialiseFileManager(String rootFolderName)
			throws Exception {

		try {
			FileManager newFileManager = new FileManager(domainName,
					pageChangeTrigger, this);
			newFileManager.setResourceStore(new LocalDriveResourceStore(
					rootFolderName, false));

			if (newFileManager.pageExists("/OpenForum/Configuration",
					getSystemLogin())) {

				KeyValueListPage keyValueListPage = new KeyValueListPage(
						newFileManager, "/OpenForum/Configuration");

				if(keyValueListPage.getValue("secure")!=null) {
					secure = keyValueListPage.getValue("secure").equals("true");
				}

				ResourceStoreProxy resourceStore = null;
				boolean hasMoreResourceStores = true;
				int resourceStoreIndex = 0;

				while (hasMoreResourceStores) {
					String storeEntry = keyValueListPage.getValue("resourceStore"
							+ resourceStoreIndex);
					if (storeEntry == null) {
						hasMoreResourceStores = false;
						continue;
					}

					if (storeEntry.startsWith("read-only:")) {
						if (resourceStore == null) {
							resourceStore = new ResourceStoreProxy(
									new LocalDriveResourceStore(
											storeEntry.substring(10), true));
						} else {
							resourceStore
									.addResourceStore(new LocalDriveResourceStore(
											storeEntry.substring(10), true));
						}
					} else {
						if (resourceStore == null) {
							resourceStore = new ResourceStoreProxy(
									new LocalDriveResourceStore(storeEntry, false));
						} else {
							resourceStore
									.addResourceStore(new LocalDriveResourceStore(
											storeEntry, false));
						}
					}
					resourceStoreIndex++;
				}

				if (resourceStore != null) {
					newFileManager.setResourceStore(resourceStore);
				}
			}

			return newFileManager;
		} catch (Exception e) {
			e.printStackTrace();
			throw new OpenForumException("Failed to initialise file manager with Root Folder Name "+rootFolderName);
		}
	}

	public OpenForumController(String rootFolderName, String domainName)
			throws Exception, AuthenticationException {
		queueManager = new MessageQueueManager();
		logger = new DefaultOpenForumLogger(this);
		authenticator = new DummyAuthenticator();
		authorizer = new DummyAuthorizer();

		pageChangeTrigger = new PageChangeTrigger(this);

		fileManager = initialiseFileManager(rootFolderName);

		fileManager.setVersionController(new DefaultVersionController(
				fileManager.getResourceStore(systemLogin)));

		try {
			pluginManager = new PluginManager(this, fileManager);
		} catch (Throwable e) {
			e.printStackTrace();
		}

		dynamicPages = new KeyValueListPage(fileManager,
				OPEN_FORUM_DYNAMIC_PAGES);
		parameterRedirectList = new KeyValueListPage(fileManager,
				OPEN_FORUM_PARAMETER_REDIRECT_LIST);

		aliasList = new KeyValueListPage(fileManager, OPEN_FORUM_ALIASES);
		this.domainName = domainName;
	}

	public void setFileManager(FileManager fileManager) {
		this.fileManager = fileManager;
	}

	public boolean isInitialised() {
		return initialised;
	}

	public Router getRouter() {
		return router;
	}

	public void setRouter(Router router) {
		this.router = router;
		logger.info("Router set for " + this.domainName);
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * org.onestonesoup.wiki.controller.WikiControllerInterface#addListener(
	 * org.onestonesoup.wiki.builder.WikiBuilderListener)
	 */
	public void addListener(OpenForumBuilderListener listener) {
		listeners.add(listener);
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * org.onestonesoup.wiki.controller.WikiControllerInterface#addExternalLink
	 * (java.lang.String)
	 */
	public void addExternalLink(String url) {
		externalLinks.put(url, url);
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * org.onestonesoup.wiki.controller.WikiControllerInterface#addMissingPage
	 * (java.lang.String, java.lang.String)
	 */
	public void addMissingPage(String missingPage, String sourcePage) {
		missingPages.put(missingPage, sourcePage);
	}

	public boolean rebuild() throws AuthenticationException, IOException {
		try {
			rebuildTrigger.triggerListeners("Rebuild", "started");
			boolean state = doBuild();
			if (state == true) {
				rebuildTrigger.triggerListeners("Rebuild", "completed");
			} else {
				rebuildTrigger.triggerListeners("Rebuild", "failed");
			}

			return state;
		} catch (Throwable e) {
			e.printStackTrace();
			return false;
		}
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see org.onestonesoup.wiki.controller.WikiControllerInterface#doBuild()
	 */
	public boolean doBuild() throws Throwable {
		queueManager.getQueue("/OpenForum")
				.postMessage(
						"Build requested at "
								+ TimeHelper.getDateTimeStamp(new Date()),
						systemLogin.getUser().getName());
		if (building) {
			queueManager.getQueue("/OpenForum").postMessage(
					"Build already in progress",
					systemLogin.getUser().getName());
			return false;
		}
		if (markedForRebuild == false) {
			queueManager.getQueue("/OpenForum").postMessage(
					"Wiki not marked for rebuild",
					systemLogin.getUser().getName());
			return false;
		}
		if (fileManager.getLastSavedTimeStamp() < lastBuildTimeStamp) {
			queueManager.getQueue("/OpenForum").postMessage(
					"Timestamp mismatch", systemLogin.getUser().getName());
			return false;
		}

		try {
			markedForRebuild = false;
			building = true;

			for (int loop = 0; loop < listeners.size(); loop++) {
				((OpenForumBuilderListener) listeners.get(loop))
						.buildStarted(this);
			}
			missingPages = new HashMap<String, String>();

			try {
				queueManager.getQueue("/OpenForum").postMessage(
						"Building reserved list",
						systemLogin.getUser().getName());
				buildReservedList();
			} catch (Exception e) {
				String exception = StringHelper.arrayToString(
						ExceptionHelper.getTrace(e), "\\");
				queueManager.getQueue("/OpenForum").postMessage(
						"Wiki rebuild failed while building reserved list."
								+ exception, systemLogin.getUser().getName());
				addJournalEntry("Wiki rebuild failed while building reserved list.\\\\"
						+ exception,null);
			}
			try {
				queueManager.getQueue("/OpenForum").postMessage(
						"Building wiki pages", systemLogin.getUser().getName());
				buildAllPages();
			} catch (Exception e) {
				String exception = StringHelper.arrayToString(
						ExceptionHelper.getTrace(e), "\\");
				queueManager.getQueue("/OpenForum").postMessage(
						"Wiki rebuild failed while building wiki pages."
								+ exception, systemLogin.getUser().getName());
				addJournalEntry("Wiki rebuild failed while building wiki pages.\\\\"
						+ exception,null);
			}
			try {
				queueManager.getQueue("/OpenForum").postMessage(
						"Building Wiki Index page",
						systemLogin.getUser().getName());
			} catch (Exception e) {
				String exception = StringHelper.arrayToString(
						ExceptionHelper.getTrace(e), "\\");
				queueManager.getQueue("/OpenForum").postMessage(
						"Wiki rebuild failed while building Wiki Index page."
								+ exception, systemLogin.getUser().getName());
				addJournalEntry("Wiki rebuild failed while building Wiki Index page.\\\\"
						+ exception,null);
			}
			try {
				queueManager.getQueue("/OpenForum").postMessage(
						"Building Wiki Missing Pages list",
						systemLogin.getUser().getName());
				buildMissingPages();
			} catch (Exception e) {
				String exception = StringHelper.arrayToString(
						ExceptionHelper.getTrace(e), "\\");
				queueManager.getQueue("/OpenForum").postMessage(
						"Wiki rebuild failed while building Wiki Missing Pages list."
								+ exception, systemLogin.getUser().getName());
				addJournalEntry("Wiki rebuild failed while building Wiki Missing Pages list.\\\\"
						+ exception,null);
			}
			try {
				queueManager.getQueue("/OpenForum").postMessage(
						"Building Wiki Journal",
						systemLogin.getUser().getName());
				buildWikiJournal();
			} catch (Exception e) {
				String exception = StringHelper.arrayToString(
						ExceptionHelper.getTrace(e), "\\");
				queueManager.getQueue("/OpenForum").postMessage(
						"Wiki rebuild failed while building Wiki Journal."
								+ exception, systemLogin.getUser().getName());
				addJournalEntry("Wiki rebuild failed while building Wiki Journal.\\\\"
						+ exception,null);
			}
			try {
				queueManager.getQueue("/OpenForum")
						.postMessage("Updating plugin manager",
								systemLogin.getUser().getName());
				updatePluginManager();
			} catch (Exception e) {
				String exception = StringHelper.arrayToString(
						ExceptionHelper.getTrace(e), "\\");
				queueManager.getQueue("/OpenForum").postMessage(
						"Wiki rebuild failed while updating jar manager."
								+ exception, systemLogin.getUser().getName());
				addJournalEntry("Wiki rebuild failed while updating jar manager.\\\\"
						+ exception,null);
			}

			queueManager.getQueue("/OpenForum").postMessage("Fin!",
					systemLogin.getUser().getName());

			for (int loop = 0; loop < listeners.size(); loop++) {
				((OpenForumBuilderListener) listeners.get(loop))
						.buildComplete(this);
			}
		} catch (Exception e) {
			String exception = StringHelper.arrayToString(
					ExceptionHelper.getTrace(e), "\\");
			queueManager.getQueue("/OpenForum").postMessage(
					"Wiki rebuild failed." + exception,
					systemLogin.getUser().getName());
			addJournalEntry("Wiki rebuild failed.\\\\" + exception,null);
		} finally {
			lastBuildTimeStamp = System.currentTimeMillis();
			building = false;
		}
		return true;
	}

	private void buildWikiJournal() throws Exception, AuthenticationException {
		buildPage(JOURNAL_PAGE_PATH, false);
	}

	public String renderWikiData(String name, String data) throws Exception,
			AuthenticationException {
		StringBuffer html = new StringBuffer("");
		WikiLinkParser linkRenderer = new WikiLinkParser(name, EDIT_PAGE,
				EDIT_LINK_DISPLAY_TEMPLATE, this);

		Renderer.wikiToHtml(name, data, html, this, linkRenderer);

		return html.toString();
	}

	private void buildMissingPages() throws Exception, AuthenticationException {
		String[] exclude = getExcludesList(EXCLUDE_REFERENCES, MISSING_PAGES_PATH);

		Set<String> missingPagesList = missingPages.keySet();
		String[] missingPageNames = missingPagesList.toArray(new String[] {});
		Arrays.sort(missingPageNames);

		StringBuffer data = new StringBuffer();
		char letter = '?';

		for (int loop = 0; loop < missingPageNames.length; loop++) {
			if (isPageExcluded(exclude, missingPageNames[loop])) {
				continue;
			}

			if (missingPageNames[loop].length() > 0
					&& letter != missingPageNames[loop].charAt(0)) {
				letter = missingPageNames[loop].charAt(0);
				data.append("*__" + Character.toUpperCase(letter) + "__\r\n");
			}
			data.append("**");
			data.append(missingPageNames[loop]);
			data.append(" missing on page [");
			data.append(missingPages.get(missingPageNames[loop]));
			data.append("]\r\n");
		}

		fileManager.saveFile(MISSING_PAGES_PATH, CONTENT_FILE, data.toString(), systemLogin, false);
		
		queueManager
				.getQueue("/OpenForum")
				.postMessage(
						" there are "
								+ missingPageNames.length
								+ " missing pages. A list of them is available <a href=\"/MissingPages\">here</a>",
						systemLogin.getUser().getName());
		buildPage(MISSING_PAGES_PATH,false);

	}

	private void buildReservedList() throws Exception {
		reserved.put(PAGES_INDEX_PAGE_PATH, PAGES_INDEX_PAGE_PATH);
		reserved.put(MISSING_PAGES_PATH, MISSING_PAGES_PATH);
		reserved.put(JOURNAL_PAGE_PATH, JOURNAL_PAGE_PATH);
	}

	private List<String> buildPagesList() throws Exception,
			AuthenticationException {
		List<String> pages = fileManager.getPageList(systemLogin);
		return pages;
	}

	private void buildAllPages() throws Exception, AuthenticationException {
		List<String> pages = buildPagesList();

		queueManager.getQueue("/OpenForum").postMessage(
				" " + pages.size() + " to build",
				systemLogin.getUser().getName());

		for (int loop = 0; loop < pages.size(); loop++) {
			String name = (String) pages.get(loop);

			if (inReservedList(name)) {
				continue;
			}

			logger.info("Building " + name);
			buildPage(name, false);

			if (loop % 100 == 0) {
				queueManager.getQueue("/OpenForum").postMessage(
						" built " + loop + " pages",
						systemLogin.getUser().getName());
			}
		}
		queueManager.getQueue("/OpenForum").postMessage(
				" built all " + pages.size() + " pages",
				systemLogin.getUser().getName());
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * org.onestonesoup.wiki.controller.WikiControllerInterface#buildPage(java
	 * .lang.String)
	 */
	public StringBuffer buildPage(String name) throws Exception,
			AuthenticationException {
		return buildPage(name, true);
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * org.onestonesoup.wiki.controller.WikiControllerInterface#buildPage(java
	 * .lang.String, boolean)
	 */
	public StringBuffer buildPage(String name, boolean buildRefersTo)
			throws Exception, AuthenticationException {
		return buildPage(name, null, buildRefersTo);
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * org.onestonesoup.wiki.controller.WikiControllerInterface#buildPage(java
	 * .lang.String, boolean)
	 */
	public StringBuffer buildPage(String name, String data,
			boolean buildRefersTo) throws Exception, AuthenticationException {
		while (name.charAt(0) == '/') {
			name = name.substring(1);
		}

		//No content
		if( data == null && fileManager.pageAttachmentExists(name, CONTENT_FILE, systemLogin)==false ) {
			return null;
		}
		
		String pageBuildScript = fileManager.getPageInheritedFileAsString(name,
				PAGE_BUILD_JS, OPEN_FORUM_DEFAULT_PAGE_PATH, systemLogin);
		
		//No build script
		if (  pageBuildScript == null) return null;

		StringBuffer html = new StringBuffer();

		try {
			html.append(runPageBuildScript(name, data, pageBuildScript));
		} catch (Throwable e) {
			html.append(StringHelper.arrayToString(
					ExceptionHelper.getTrace(e), "\n"));
		}

		pageChangeTrigger.triggerListeners(name, "Page Changed");

		return html;
	}

	private String runPageBuildScript(String name, String content, String script)
			throws Throwable {
		JavascriptEngine js = getJavascriptEngine(systemLogin);
		if (content != null) {
			js.mount("content", content);
		}
		js.mount("pageName", name);

		return (js.evaluateJavascript(name + "/" + PAGE_BUILD_JS, script))
				.toString();
	}

	private String[] getExcludesList(String excludeFile, String pageName)
			throws Exception, AuthenticationException {
		String excludeData = fileManager.getPageInheritedFileAsString(pageName,
				excludeFile, "/OpenForum/Page", getSystemLogin());
		String[] excludes = new String[0];
		if (excludeData != null) {
			excludes = excludeData.split("\n");
			for (int loopEx = 0; loopEx < excludes.length; loopEx++) {
				excludes[loopEx] = excludes[loopEx].trim();
			}
		}
		return excludes;
	}

	private boolean isPageExcluded(String[] excludes, String pageTitle) {
		boolean exclude = false;
		for (int loopEx = 0; loopEx < excludes.length; loopEx++) {
			if (pageTitle == null || pageTitle.matches(excludes[loopEx])) {
				exclude = true;
				break;
			}
		}
		return exclude;
	}

	private boolean inReservedList(String name) {
		if (reserved.get(name) == null
				&& reserved.get(OpenForumNameHelper.titleToWikiName(name)) == null) {
			return false;
		} else {
			return true;
		}
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * org.onestonesoup.wiki.controller.WikiControllerInterface#getPageTimeStamp
	 * (java.lang.String)
	 */
	public long getPageTimeStamp(String pageName) throws Exception,
			AuthenticationException {
		return fileManager.getPageTimeStamp(pageName, systemLogin);
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * org.onestonesoup.wiki.controller.WikiControllerInterface#attachFile(java
	 * .lang.String, java.lang.String, java.lang.String, boolean)
	 */
	public void attachFile(String pageName, String fileName, String data,
			boolean backup) throws Exception, AuthenticationException {
		if (fileName.length() == 0) {
			return;
		}

		fileManager.saveStringAsAttachment(data, pageName, fileName,
				systemLogin, backup);
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * org.onestonesoup.wiki.controller.WikiControllerInterface#addJournalEntry
	 * (java.lang.String)
	 */
	public void addJournalEntry(String entry, Login user) throws Exception,
			AuthenticationException {
		if(user==systemLogin) {
			return;
		}
		
		entry = "* " + TimeHelper.getDisplayTimestamp(new Date()) + ":" + entry + "<br/>\n";
		fileManager.appendStringToFile(entry, JOURNAL_PAGE_PATH, CONTENT_FILE, false, false, systemLogin);
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * org.onestonesoup.wiki.controller.WikiControllerInterface#delete(java.
	 * lang.String, org.onestonesoup.authentication.server.Login)
	 */
	public void delete(String pageName, Login login) throws Exception,
			AuthenticationException, OpenForumException {
		try {
			addJournalEntry("Page " + pageName + " deleted by " + login.getUser().getName(),login );
		} catch (Exception ioe) {
		}

		fileManager.deletePage(pageName, login);

		pageChangeTrigger.triggerListeners(pageName, "Page Deleted");
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * org.onestonesoup.wiki.controller.WikiControllerInterface#delete(java.
	 * lang.String, java.lang.String,
	 * org.onestonesoup.authentication.server.Login)
	 */
	public void delete(String pageName, String fileName, Login login)
			throws Exception, AuthenticationException {
		try {
			addJournalEntry("File " + fileName + " on Page [" + pageName
					+ "] deleted by " + login.getUser().getName(),login);
		} catch (Exception ioe) {
		}

		fileManager.deleteAttachment(pageName, fileName, login);
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * org.onestonesoup.wiki.controller.WikiControllerInterface#savePage(java
	 * .lang.String, java.lang.String, java.lang.String,
	 * org.onestonesoup.xml.EntityTree,
	 * org.onestonesoup.authentication.server.Login)
	 */
	public void savePage(String pageName, String source, String tags,
			EntityTree.TreeEntity postParameters, Login login)
			throws Exception, AuthenticationException {
		String author = OpenForumNameHelper.titleToWikiName(login.getUser()
				.getName());

		pageName = OpenForumNameHelper.titleToWikiName(pageName);
		boolean tagsChanged = false;
		if (tags != null) {
			String oldTags = "";

			if (fileManager.pageAttachmentExists(pageName, TAGS_FILE, login)) {
				oldTags = fileManager.getPageAttachmentAsString(pageName,
						TAGS_FILE, login);
			}

			if (oldTags.equals(tags) == false) {
				fileManager.saveStringAsAttachment(tags, pageName, TAGS_FILE,
						login, true);
				tagsChanged = true;
			}
		}

		if (postParameters != null) {
			EntityTree dataToFileMap = null;
			/*
			 * if (fileManager .pageAttachmentExists(pageName, DATA_MAP_FILE,
			 * login)) { dataToFileMap =
			 * JSONHelper.toTree(fileManager.getPageAttachmentAsString(pageName,
			 * DATA_MAP_FILE, login)); } else if
			 * (fileManager.pageAttachmentExists( OPEN_FORUM_DEFAULT_PAGE_PATH,
			 * DATA_MAP_FILE, login)) { dataToFileMap =
			 * JSONHelper.toTree(fileManager.getPageAttachmentAsString(
			 * OPEN_FORUM_DEFAULT_PAGE_PATH, DATA_MAP_FILE, login)); }
			 */
			if (dataToFileMap != null) {
				for (int loop = 0; loop < dataToFileMap.getChildren().size(); loop++) {
					EntityTree.TreeEntity mapping = dataToFileMap.getChildren()
							.get(loop);
					String from = mapping.getAttribute("from");
					String to = mapping.getAttribute("to");

					EntityTree.TreeEntity fromData = postParameters
							.getChild(from);
					if (fromData != null) {
						fileManager.saveStringAsAttachment(fromData.getValue(),
								pageName, to, login, true);
						fromData.setValue("&" + from + ";");
					}
				}
			}
		}

		if (fileManager.saveStringAsPageSource(source, pageName, login) == false
				&& tagsChanged == false) {
			return;
		} else {
			String owner = fileManager.getPageAttachmentAsString(pageName,
					OWNER_FILE, getSystemLogin());

			if (owner == null) {
				fileManager.saveStringAsAttachment(author, pageName,
						OWNER_FILE, login, false);
			} else if (author.equals("Admin") == false) {
				fileManager.saveStringAsAttachment(author, pageName,
						OWNER_FILE, login, false);
			}
		}
		try {
			if (fileManager.pageExists(pageName, login)) {
				addJournalEntry("Page [" + pageName
						+ "] changed by " + author,login);
			} else {
				addJournalEntry("Page [" + pageName
						+ "] added by " + author,login);
			}
		} catch (Exception ioe) {
		}

		/*
		 * String properties =
		 * "#OSS Wiki page properties for page "+pageName+"\n"+
		 * "#"+WikiBuilder.WikiTimeHelper.getCurrentDisplayTimestamp()+"\n"+
		 * "author="+user; target = getPageSourcePropertiesFile(pageName);
		 * FileHelper.buildFile(target.getAbsolutePath(),properties.getBytes());
		 */

		// globalLinks.put( pageName,pageName );
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * org.onestonesoup.wiki.controller.WikiControllerInterface#copyPage(java
	 * .lang.String, java.lang.String, java.lang.String,
	 * org.onestonesoup.authentication.server.Login)
	 */
	public void copyPage(String sourcePageName, String newPageName,
			String listPage, Login login) throws Exception,
			AuthenticationException {
		sourcePageName = OpenForumNameHelper.titleToWikiName(sourcePageName);
		newPageName = OpenForumNameHelper.titleToWikiName(newPageName);
		if (fileManager.pageExists(sourcePageName, login) == false) {
			return; // If page does not exist, return
		}
		String source = fileManager
				.getPageSourceAsString(sourcePageName, login);
		String tags = "";
		if (fileManager.pageAttachmentExists(sourcePageName, TAGS_FILE, login)) {
			tags = fileManager.getPageAttachmentAsString(sourcePageName,
					TAGS_FILE, login);
		}

		savePage(newPageName, source, tags, null, login);
		buildPage(newPageName);

		copyAttachments(sourcePageName, newPageName, login);
		updateListPage(newPageName, listPage, login, false);

		buildPage(newPageName);
	}

	private int updateListPage(String pageName, String listPageName,
			Login login, boolean requiresIndex) throws Exception,
			AuthenticationException {
		int index = -1;
		if (listPageName != null) {
			listPageName = OpenForumNameHelper.titleToWikiName(listPageName);
			pageName = OpenForumNameHelper.titleToWikiName(pageName);
			if (getFileManager().pageExists(pageName, login) == false) {
				savePage(pageName, "", "", null, login);
				buildPage(pageName);
			}

			addToListPage(listPageName, pageName, systemLogin);

			if (requiresIndex) {
				if (getFileManager().pageAttachmentExists(listPageName,
						INDEX_FILE, login) == false) {
					attachFile(listPageName, INDEX_FILE, "<index>1</index>",
							false);
				}

				/*
				 * EntityTree indexValue = JSONHelper.toTree(getFileManager()
				 * .getPageAttachmentAsString(listPageName, INDEX_FILE, login));
				 * index = Integer.parseInt(indexValue.getValue());
				 * indexValue.setValue("" + (index + 1));
				 * 
				 * attachFile(listPageName, INDEX_FILE,
				 * XmlHelper.toXml(indexValue), false);
				 */
			}
		}

		return index;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * org.onestonesoup.wiki.controller.WikiControllerInterface#copyAttachments
	 * (java.lang.String, java.lang.String,
	 * org.onestonesoup.authentication.server.Login)
	 */
	public void copyAttachments(String sourcePageName, String pageName,
			Login login) throws Exception, AuthenticationException {
		Map<String, String> attachments = fileManager.getPageAttachments(
				sourcePageName, login);

		Set<String> keys = attachments.keySet();

		// links.txt includes a list of the page attachments that should be
		// linked to rather than copied
		String[] links = new String[0];
		if (fileManager.pageAttachmentExists(sourcePageName, LINKS_FILE, login)) {
			links = fileManager.getPageAttachmentAsString(sourcePageName,
					LINKS_FILE, login).split(" ");
		}

		for (String fileName : keys) {
			if (fileName.equals(PAGE_FILE) || fileName.equals(LINKS_FILE)) {
				continue;
			}

			int loop = 0;
			for (loop = 0; loop < links.length; loop++) {
				if (fileName.equals(links[loop])) {
					createLinkFile(sourcePageName, pageName, fileName, login);
					break;
				}
			}
			if (loop == links.length) {
				if (fileName.charAt(0) == '+') {
					fileName = fileName.substring(1);
					if (fileName.equals("history")) {
						continue;
					} else {
						copyAttachments(sourcePageName + "/" + fileName,
								pageName + "/" + fileName, login);
						try {
							String source = getFileManager()
									.getPageAttachmentAsString(
											pageName + "/" + fileName,
											CONTENT_FILE, login);
							String tags = getFileManager()
									.getPageAttachmentAsString(
											pageName + "/" + fileName,
											CONTENT_FILE, login);
							savePage(pageName + "/" + fileName, source, tags,
									null, login);
							buildPage(pageName + "/" + fileName);
						} catch (Exception e) {
							e.printStackTrace();
						}
					}
				} else {
					logger.info("Copying " + fileName + " from "
							+ sourcePageName + " to " + pageName);
					fileManager.copyAttachment(fileName, sourcePageName,
							pageName, login);
				}
			}

		}
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * org.onestonesoup.wiki.controller.WikiControllerInterface#createLinkFile
	 * (java.lang.String, java.lang.String, java.lang.String,
	 * org.onestonesoup.authentication.server.Login)
	 */
	public void createLinkFile(String sourcePageName, String pageName,
			String fileName, Login login) throws Exception,
			AuthenticationException {
		String linkData = sourcePageName + "/" + fileName;

		saveAsAttachment(pageName, fileName + ".link", linkData.getBytes(),
				login);
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * org.onestonesoup.wiki.controller.WikiControllerInterface#saveAsAttachment
	 * (java.lang.String, java.lang.String, org.onestonesoup.wiki.WikiStream,
	 * org.onestonesoup.authentication.server.Login)
	 */
	public long saveAsAttachment(String pageName, String fileName,
			Stream wikiStream, Login login) throws Exception,
			AuthenticationException {
		return fileManager.saveWikiStreamAsAttachment(wikiStream, pageName,
				fileName, login);

	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * org.onestonesoup.wiki.controller.WikiControllerInterface#saveAsAttachment
	 * (java.lang.String, java.lang.String, byte[],
	 * org.onestonesoup.authentication.server.Login)
	 */
	public long saveAsAttachment(String pageName, String fileName, byte[] data,
			Login login) throws Exception, AuthenticationException {
		fileManager.saveAsAttachment(data, pageName, fileName, login);
		return data.length;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * org.onestonesoup.wiki.controller.WikiControllerInterface#addToListPage
	 * (java.lang.String, java.lang.String)
	 */
	public void addToListPage(String listPageName, String pageName, Login login)
			throws Exception, AuthenticationException {
		String displayName = OpenForumNameHelper.wikiNameToTitle(pageName)
				.trim();

		String listData = fileManager
				.getPageSourceAsString(listPageName, login);
		String[][] list = DataHelper.getPageAsList(listData);
		for (int loop = 0; loop < list.length; loop++) {
			if (list[loop][0].equals(displayName)) {
				return;
			}
		}

		String data = fileManager.getPageSourceAsString(listPageName, login);
		data = data + "\n*[" + displayName + "|" + pageName + "]";

		fileManager.saveStringAsPageSource(data, listPageName, login);

		buildPage(listPageName, false);
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * org.onestonesoup.wiki.controller.WikiControllerInterface#getFileManager()
	 */
	public FileManager getFileManager() {
		return fileManager;
	}

	public Login getSystemLogin() {
		return systemLogin;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see org.onestonesoup.wiki.controller.WikiControllerInterface#
	 * getStandardTemplateData(java.lang.String, java.lang.String,
	 * java.lang.String, java.lang.String)
	 */
	public Map<String, String> getStandardTemplateData(String pageName,
			String title, String author, String timeStamp) {
		while (pageName.charAt(0) == '/') {
			pageName = pageName.substring(1);
		}

		if (timeStamp == null) {
			timeStamp = fileManager.getTimestampForPage(pageName, systemLogin);
		}
		if (author == null) {
			author = fileManager.getAuthorForPage(pageName, systemLogin);
			if (author == null) {
				author = "-not defined-";
			}
		}
		if (title == null) {
			title = OpenForumNameHelper.wikiNameToTitle(pageName);
		}

		Map<String, String> localTemplateData = new HashMap<String, String>();
		localTemplateData.put("pageName", pageName);
		localTemplateData.put("title", title);
		localTemplateData.put("author", author);
		localTemplateData.put("referringPages", "");
		localTemplateData.put("attachments", "");
		localTemplateData.put("tags", "");
		localTemplateData.put("author", author);
		localTemplateData.put("time", timeStamp);

		return localTemplateData;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * org.onestonesoup.wiki.controller.WikiControllerInterface#getQueueManager
	 * ()
	 */
	public MessageQueueManager getQueueManager() {
		return queueManager;
	}

	public Store getStore() {
		return store;
	}

	public void markForRebuild() {
		markedForRebuild = true;
	}

	public String getDomainName() {
		return domainName;
	}

	public List<KeyValuePair> getDynamicPagesList() throws Exception {
		return dynamicPages.getList();
	}

	public String getAliasLink(String alias) throws Exception {
		return (String) aliasList.getHashList().get(alias);
	}

	public List<KeyValuePair> getParameterRedirectList() throws Exception {
		return parameterRedirectList.getList();
	}

	public String getHomePage() {
		return homePage;
	}

	public void setHomePage(String homePage) {
		this.homePage = homePage;
	}

	public JavascriptEngine getJavascriptEngine(Login login) {
		// Create a javascript engine to run the script
		JavascriptEngine js = new JavascriptEngine();

		// Create processors for use by the script
		JavascriptHelper jsHelper = new JavascriptHelper(js, this,
				getFileManager(), login);
		JavascriptOpenForumHelper openForumHelper = new JavascriptOpenForumHelper(
				this, login);
		JavascriptExternalResourceHelper externalHelper = new JavascriptExternalResourceHelper(
				getFileManager(), login);
		JavascriptFileHelper fileHelper = new JavascriptFileHelper(this, login);
		js.mount("JSON", new JSON(js));
		js.mount("js", jsHelper);
		js.mount("wiki", openForumHelper); // Deprecated
		js.mount("openForum", openForumHelper);
		js.mount("external", externalHelper);
		js.mount("file", fileHelper);
		js.mount("log", logger);

		return js;
	}

	public Map<String, String> getMimeTypes() {
		return mimeTypes;
	}

	public String generateUniqueId() {
		String id = "UID:" + ID_COUNTER + (Math.random() * 1000000)
				+ System.currentTimeMillis();
		ID_COUNTER++;
		return id;
	}

	public void revert(String pageName, String version, Login login)
			throws AuthenticationException {
		try {
			fileManager.revert(pageName, version, login);
			buildPage(pageName);
			addJournalEntry("Page " + pageName + " reverted to version "
					+ version + " by " + login.getUser().getName(),login);
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	public Authenticator getAuthenticator() {
		return authenticator;
	}

	public Authorizer getAuthorizer() {
		return authorizer;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see org.onestonesoup.wiki.file.manager.FileManager#updatePluginManager()
	 */
	public void updatePluginManager() throws Throwable {
		pluginManager.clearAllAPIs();
		pluginManager.updateClassPath();
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * org.onestonesoup.wiki.file.manager.FileManager#getApi(java.lang.String)
	 */
	public Object getApi(String pageName) throws Throwable {
		return pluginManager.getApi(pageName);
	}

	public void initialise() throws IOException, AuthenticationException {
		try {
			updatePluginManager();

			if (fileManager.pageExists("/OpenForum/", getSystemLogin())) {
				String data = fileManager.getPageAttachmentAsString(
						"/OpenForum/", "mime-types.xml", getSystemLogin());
				EntityTree xmlData = XmlHelper.parseElement(data);
				mimeTypes = XmlHelper.getChildAsMap(xmlData, "file-extension");
			}

			router = new Router("name", this);

			if (fileManager.pageExists("/OpenForum/Configuration",
					getSystemLogin())) {
				KeyValueListPage keyValueListPage = new KeyValueListPage(
						fileManager, "/OpenForum/Configuration");
				String authenticatorClassName = keyValueListPage
						.getValue("authenticator");
				String authorizerClassName = keyValueListPage
						.getValue("authorizer");

				Authorizer newAuthorizer = null;
				if (authorizerClassName != null) {
					newAuthorizer = (Authorizer) Class.forName(
							authorizerClassName).newInstance();
					newAuthorizer.setController(this);
				}

				Authenticator newAuthenticator = null;
				if (authenticatorClassName != null) {
					newAuthenticator = (Authenticator) Class.forName(
							authenticatorClassName).newInstance();
					newAuthenticator.setController(this);
					newAuthenticator.setFileServer(router.getFileServer());
				}

				if (newAuthorizer != null) {
					authorizer = newAuthorizer;
				}
				if (newAuthenticator != null) {
					authenticator = newAuthenticator;
				}
			}

			initialised = true;

			//TODO This does not seem to do anything
			/*logger.info("Building Wiki Page List");
			buildPagesList();
			logger.info("Built Wiki Page List");*/

			logger.info("Running Wiki Startup Triggers");
			StartUpTrigger startUpTrigger = new StartUpTrigger(this);
			startUpTrigger.triggerListeners("Open Forum", "start");
			logger.info("Ran Wiki Startup Triggers");

			logger.info("Creating Wiki Rebuild Trigger");
			rebuildTrigger = new RebuildTrigger(this);
			logger.info("Created Wiki Rebuild Trigger");

			logger.info("Creating Wiki Time Triggers");
			timerTrigger = new TimerTrigger(this);
			logger.info("Created Wiki Time Triggers");

			logger.info("Wiki initialised");
		} catch (Throwable t) {
			t.printStackTrace();
		}
	}

	public OpenForumLogger getLogger() {
		return logger;
	}

	public boolean isSecure() {
		return secure;
	}
}