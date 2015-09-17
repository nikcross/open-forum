package org.onestonesoup.openforum.controller;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.PrintStream;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.onestonesoup.core.ExceptionHelper;
import org.onestonesoup.core.FileHelper;
import org.onestonesoup.core.NameHelper;
import org.onestonesoup.core.StringHelper;
import org.onestonesoup.core.TemplateHelper;
import org.onestonesoup.core.data.CSVHelper;
import org.onestonesoup.core.data.EntityTable;
import org.onestonesoup.core.data.EntityTable.TableEntity;
import org.onestonesoup.core.data.EntityTree;
import org.onestonesoup.core.data.KeyValuePair;
import org.onestonesoup.core.data.XmlHelper;
import org.onestonesoup.core.process.logging.LogFile;
import org.onestonesoup.javascript.engine.JSON;
import org.onestonesoup.javascript.engine.JavascriptEngine;
import org.onestonesoup.openforum.DataHelper;
import org.onestonesoup.openforum.KeyValueListPage;
import org.onestonesoup.openforum.OpenForumException;
import org.onestonesoup.openforum.OpenForumNameHelper;
import org.onestonesoup.openforum.Renderer;
import org.onestonesoup.openforum.Stream;
import org.onestonesoup.openforum.TimeHelper;
import org.onestonesoup.openforum.catalogue.PagesCatalogue;
import org.onestonesoup.openforum.filemanager.FileManager;
import org.onestonesoup.openforum.filemanager.LocalDriveResourceStore;
import org.onestonesoup.openforum.filemanager.Resource;
import org.onestonesoup.openforum.javascript.JavascriptExternalResourceHelper;
import org.onestonesoup.openforum.javascript.JavascriptFileHelper;
import org.onestonesoup.openforum.javascript.JavascriptHelper;
import org.onestonesoup.openforum.javascript.JavascriptOpenForumHelper;
import org.onestonesoup.openforum.messagequeue.MessageQueueManager;
import org.onestonesoup.openforum.plugin.JarManager;
import org.onestonesoup.openforum.renderers.WikiLinkParser;
import org.onestonesoup.openforum.router.Router;
import org.onestonesoup.openforum.security.AuthenticationException;
import org.onestonesoup.openforum.security.Authenticator;
import org.onestonesoup.openforum.security.Authorizer;
import org.onestonesoup.openforum.security.DummyAuthenticator;
import org.onestonesoup.openforum.security.DummyAuthorizer;
import org.onestonesoup.openforum.security.Login;
import org.onestonesoup.openforum.store.Store;
import org.onestonesoup.openforum.transaction.HttpRequestHelper;
import org.onestonesoup.openforum.trigger.PageChangeTrigger;
import org.onestonesoup.openforum.trigger.RebuildTrigger;
import org.onestonesoup.openforum.trigger.StartUpTrigger;
import org.onestonesoup.openforum.trigger.TimerTrigger;
import org.onestonesoup.openforum.versioncontrol.DefaultVersionController;
import org.onestonesoup.openforum.versioncontrol.PageVersion;

public class OpenForumController implements OpenForumScripting,
		OpenForumConstants, OpenForumBuilder, OpenForumPageController,
		OpenForumSecurity {

	private long ID_COUNTER = 1;
	private static final String EXCLUDE_REFERENCES = "exclude-references.txt";

	private List<OpenForumBuilderListener> listeners = new ArrayList<OpenForumBuilderListener>();

	private PagesCatalogue catalogue;
	private Router router;

	private Map<String, String> reserved = new HashMap<String, String>();

	private Map<String, String> missingPages = new HashMap<String, String>();
	private Map<String, String> externalLinks = new HashMap<String, String>();

	private long lastBuildTimeStamp;
	private boolean building = false;
	private boolean markedForRebuild = true;
	private OpenForumPageBuildQueue pageBuildQueue;

	private String domainName;
	private FileManager fileManager;
	private JarManager jarManager;
	private Login systemLogin = new Login("System", "");

	private RebuildTrigger rebuildTrigger;
	@SuppressWarnings("unused")
	private TimerTrigger timerTrigger;
	private PageChangeTrigger pageChangeTrigger;

	private MessageQueueManager queueManager;
	private Store store = new Store();
	private KeyValueListPage dynamicPages;
	private KeyValueListPage securePages;
	private KeyValueListPage nonSecurePages;
	private KeyValueListPage adminOnlyPages;
	private KeyValueListPage loginByIPAddress;
	private KeyValueListPage parameterRedirectList;
	private KeyValueListPage aliasList;
	private Map<String, String> mimeTypes = new HashMap<String, String>();

	private String homePage = "/Home";

	private boolean initialised = false;
	private Authenticator authenticator;
	private Authorizer authorizer;

	public class Logger {
		public void error(String message) {
			System.out.println("ERROR: " + message);
		}

		public void info(String message) {
			System.out.println("Info: " + message);

		}

		public void debug(String message) {
			System.out.println("Debug: " + message);
		}
	}

	private Logger logger = new Logger();

	public OpenForumController(String rootFolderName, String domainName)
			throws Exception, AuthenticationException {
		authenticator = new DummyAuthenticator();
		authorizer = new DummyAuthorizer();

		pageChangeTrigger = new PageChangeTrigger(this);

		fileManager = new FileManager(domainName, pageChangeTrigger, this);
		fileManager
				.setResourceStore(new LocalDriveResourceStore(rootFolderName));
		fileManager.setVersionController(new DefaultVersionController(
				fileManager.getResourceStore(systemLogin)));

		try {
			jarManager = new JarManager(this, fileManager);
		} catch (Throwable e) {
			e.printStackTrace();
		}

		queueManager = new MessageQueueManager();
		dynamicPages = new KeyValueListPage(fileManager,
				"/OpenForum/DynamicPages");
		securePages = new KeyValueListPage(fileManager,
				"/OpenForum/SecurePages");
		nonSecurePages = new KeyValueListPage(fileManager,
				"/OpenForum/NonSecurePages");
		adminOnlyPages = new KeyValueListPage(fileManager,
				"/OpenForum/AdminOnlyPages");
		loginByIPAddress = new KeyValueListPage(fileManager,
				"/OpenForum/LoginByIPAddress");
		parameterRedirectList = new KeyValueListPage(fileManager, "/OpenForum/ParameterRedirectList");
		
		aliasList = new KeyValueListPage(fileManager, "/OpenForum/Aliases");
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
		System.out.println("Router set for "+this.domainName);
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
						+ exception);
			}
			try {
				queueManager.getQueue("/OpenForum").postMessage(
						"Cleaning Catalogue", systemLogin.getUser().getName());
				catalogue.cleanCatalogue();
			} catch (Exception e) {
				String exception = StringHelper.arrayToString(
						ExceptionHelper.getTrace(e), "\\");
				queueManager.getQueue("/OpenForum").postMessage(
						"Wiki rebuild failed while Cleaning Catalogue."
								+ exception, systemLogin.getUser().getName());
				addJournalEntry("Wiki rebuild failed while Cleaning Catalogue.\\\\"
						+ exception);
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
						+ exception);
			}
			try {
				queueManager.getQueue("/OpenForum").postMessage(
						"Building Wiki Index page",
						systemLogin.getUser().getName());
				buildIndexPage();
			} catch (Exception e) {
				String exception = StringHelper.arrayToString(
						ExceptionHelper.getTrace(e), "\\");
				queueManager.getQueue("/OpenForum").postMessage(
						"Wiki rebuild failed while building Wiki Index page."
								+ exception, systemLogin.getUser().getName());
				addJournalEntry("Wiki rebuild failed while building Wiki Index page.\\\\"
						+ exception);
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
						+ exception);
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
						+ exception);
			}
			try {
				queueManager.getQueue("/OpenForum").postMessage(
						"Building search table",
						systemLogin.getUser().getName());
				OutputStream oStream = fileManager.getAttachmentOutputStream(
						SEARCH_RESULTS_PAGE_PATH, SEARCH_TABLE_FILE, getSystemLogin());
				PrintStream out = new PrintStream(oStream);
				oStream.flush();
				oStream.close();
			} catch (Exception e) {
				String exception = StringHelper.arrayToString(
						ExceptionHelper.getTrace(e), "\\");
				queueManager.getQueue("/OpenForum").postMessage(
						"Wiki rebuild failed while building search table"
								+ exception, systemLogin.getUser().getName());
				addJournalEntry("Wiki rebuild failed while building search table\\\\"
						+ exception);
			}
			try {
				queueManager.getQueue("/OpenForum")
						.postMessage("Updating jar manager",
								systemLogin.getUser().getName());
				updateJarManager();
			} catch (Exception e) {
				String exception = StringHelper.arrayToString(
						ExceptionHelper.getTrace(e), "\\");
				queueManager.getQueue("/OpenForum").postMessage(
						"Wiki rebuild failed while updating jar manager."
								+ exception, systemLogin.getUser().getName());
				addJournalEntry("Wiki rebuild failed while updating jar manager.\\\\"
						+ exception);
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
			addJournalEntry("Wiki rebuild failed.\\\\" + exception);
		} finally {
			lastBuildTimeStamp = System.currentTimeMillis();
			building = false;
		}
		return true;
	}

	/*
	 * private void buildTemplateData() throws
	 * IOException,AuthenticationException {
	 * templateData.put("timestamp",WikiTimeHelper
	 * .getCurrentDisplayTimestamp());
	 * 
	 * String data = fileManager.getPageSourceAsString(LEFT_MENU,systemLogin);
	 * StringBuffer html = new StringBuffer();
	 * 
	 * WikiLinkParser linkRenderer = new
	 * WikiLinkParser(LEFT_MENU,EDIT_PAGE,EDIT_LINK_DISPLAY_TEMPLATE
	 * ,globalLinks,this); WikiRenderer.wikiToHtml(
	 * LEFT_MENU,data,html,this,linkRenderer );
	 * 
	 * templateData.put("menu",html.toString()); }
	 */

	/*
	 * private void buildSpecialPages() throws
	 * IOException,AuthenticationException { buildIndexPage();
	 * buildMissingPages(); buildWikiJournal(); }
	 */

	private void buildWikiJournal() throws Exception, AuthenticationException {
		buildPage(WIKI_JOURNAL_PAGE_PATH, false);
	}

	private void buildIndexPage() throws Exception, AuthenticationException {
		String[] exclude = getExcludesList(EXCLUDE_REFERENCES, PAGES_INDEX_PAGE_PATH);
		Map<String, String> localTemplateData = getStandardTemplateData(
				PAGES_INDEX_PAGE_PATH, SYSTEM_NAME, null,
				TimeHelper.getCurrentDisplayTimestamp());

		String headerTemplate = fileManager.getPageInheritedFileAsString(
				PAGES_INDEX_PAGE_PATH, HEADER_HTML_TEMPLATE, OPEN_FORUM_DEFAULT_PAGE_PATH,
				systemLogin);
		getRequiredTemplateInserts(PAGES_INDEX_PAGE_PATH, headerTemplate,
				localTemplateData);

		String header = TemplateHelper.generateStringWithTemplate(
				headerTemplate, localTemplateData);
		StringBuffer html = new StringBuffer(header);

		List<String> pages = catalogue.getPageNames();
		String[] pageNames = pages.toArray(new String[] {});

		for (int loop = 0; loop < pageNames.length; loop++) {
			if (pageNames[loop].charAt(0) == '/') {
				pageNames[loop] = pageNames[loop].substring(1);
			}
		}
		Arrays.sort(pageNames);

		StringBuffer data = new StringBuffer();
		char letter = '?';

		for (int loop = 0; loop < pageNames.length; loop++) {
			if (pageNames[loop].matches(".*/history")) {
				continue;
			}
			if (pageNames[loop].length() == 0) {
				continue;
			}
			if (isPageExcluded(exclude, pageNames[loop])) {
				continue;
			}

			if (letter != pageNames[loop].charAt(0)) {
				letter = pageNames[loop].charAt(0);
				data.append("*__" + Character.toUpperCase(letter) + "__\r\n");
			}
			// String pageName = pageNames[loop];
			// pageName = pageName.substring( pageName.lastIndexOf('/') );

			data.append("**[");
			// data.append(pageName);
			// data.append('|');
			data.append(pageNames[loop]);
			data.append("]\r\n");
		}

		WikiLinkParser linkRenderer = new WikiLinkParser("Pages Index",
				EDIT_PAGE, EDIT_LINK_DISPLAY_TEMPLATE, this);
		Renderer.wikiToHtml("Pages Index", data.toString(), html, this,
				linkRenderer);
		String footerTemplate = fileManager.getPageAttachmentAsString(
				OPEN_FORUM_DEFAULT_PAGE_PATH, FOOTER_HTML_TEMPLATE, systemLogin);
		getRequiredTemplateInserts(PAGES_INDEX_PAGE_PATH, footerTemplate,
				localTemplateData);
		String footer = TemplateHelper.generateStringWithTemplate(
				footerTemplate, localTemplateData);

		html.append(footer);

		fileManager.saveStringAsHtmlPage(html.toString(), PAGES_INDEX_PAGE_PATH,
				systemLogin);
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * org.onestonesoup.wiki.controller.WikiControllerInterface#buildPage(java
	 * .lang.String, java.lang.String, boolean)
	 */
	public String buildPage(String name, String data, boolean isWikiContent)
			throws Exception, AuthenticationException {
		Map<String, String> localTemplateData = getStandardTemplateData(name,
				name, SYSTEM_NAME, TimeHelper.getCurrentDisplayTimestamp());
		WikiLinkParser linkRenderer = new WikiLinkParser(name, EDIT_PAGE,
				EDIT_LINK_DISPLAY_TEMPLATE, this);
		/*
		 * if( fileManager.folderExists(name,systemLogin) ) { StringBuffer
		 * attachmentsHtml = linkRenderer.getAttachments(this);
		 * localTemplateData.put("attachments",attachmentsHtml.toString()); }
		 */

		String headerTemplate = fileManager.getPageInheritedFileAsString(name,
				HEADER_HTML_TEMPLATE, OPEN_FORUM_DEFAULT_PAGE_PATH, systemLogin);
		getRequiredTemplateInserts(name, headerTemplate, localTemplateData);
		String header = TemplateHelper.generateStringWithTemplate(
				headerTemplate, localTemplateData);
		StringBuffer html = new StringBuffer(header);

		List<String> pages = catalogue.getPageNames();
		String[] pageNames = pages.toArray(new String[] {});
		Arrays.sort(pageNames);

		if (isWikiContent) {
			Renderer.wikiToHtml(name, data, html, this, linkRenderer);
		} else {
			html.append(data);
		}

		String footerTemplate = fileManager.getPageInheritedFileAsString(name,
				FOOTER_HTML_TEMPLATE, OPEN_FORUM_DEFAULT_PAGE_PATH, systemLogin);
		getRequiredTemplateInserts(name, footerTemplate, localTemplateData);
		String footer = TemplateHelper.generateStringWithTemplate(
				footerTemplate, localTemplateData);

		html.append(footer);

		return html.toString();
	}

	public String renderWikiData(String name, String data) throws Exception,
			AuthenticationException {
		StringBuffer html = new StringBuffer("");
		WikiLinkParser linkRenderer = new WikiLinkParser(name, EDIT_PAGE,
				EDIT_LINK_DISPLAY_TEMPLATE, this);

		Map<String, String> localTemplateData = getStandardTemplateData(name,
				name, SYSTEM_NAME, TimeHelper.getCurrentDisplayTimestamp());
		data = TemplateHelper.generateStringWithTemplate(data,
				localTemplateData);

		Renderer.wikiToHtml(name, data, html, this, linkRenderer);

		return html.toString();
	}

	private void buildMissingPages() throws Exception, AuthenticationException {
		String[] exclude = getExcludesList(EXCLUDE_REFERENCES, MISSING_PAGES_PATH);
		Map<String, String> localTemplateData = getStandardTemplateData(
				MISSING_PAGES_PATH, null, SYSTEM_NAME,
				TimeHelper.getCurrentDisplayTimestamp());

		String headerTemplate = fileManager.getPageInheritedFileAsString(
				MISSING_PAGES_PATH, HEADER_HTML_TEMPLATE, OPEN_FORUM_DEFAULT_PAGE_PATH,
				systemLogin);
		getRequiredTemplateInserts(MISSING_PAGES_PATH, headerTemplate,
				localTemplateData);
		String header = TemplateHelper.generateStringWithTemplate(
				headerTemplate, localTemplateData);
		StringBuffer html = new StringBuffer(header);

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

		queueManager
				.getQueue("/OpenForum")
				.postMessage(
						" there are "
								+ missingPageNames.length
								+ " missing pages. A list of them is available <a href=\"/MissingPages\">here</a>",
						systemLogin.getUser().getName());

		WikiLinkParser linkRenderer = new WikiLinkParser("Missing Pages",
				EDIT_PAGE, EDIT_LINK_DISPLAY_TEMPLATE, this);
		Renderer.wikiToHtml("Missing Pages", data.toString(), html, this,
				linkRenderer);

		String footerTemplate = fileManager.getPageInheritedFileAsString(
				"MissingPages", FOOTER_HTML_TEMPLATE, OPEN_FORUM_DEFAULT_PAGE_PATH,
				systemLogin);
		getRequiredTemplateInserts(MISSING_PAGES_PATH, footerTemplate,
				localTemplateData);
		String footer = TemplateHelper.generateStringWithTemplate(
				footerTemplate, localTemplateData);

		html.append(footer);
		fileManager.saveStringAsHtmlPage(html.toString(), MISSING_PAGES_PATH,
				systemLogin);
	}

	private void buildReservedList() throws Exception {
		reserved.put(PAGES_INDEX_PAGE_PATH, PAGES_INDEX_PAGE_PATH);
		reserved.put(MISSING_PAGES_PATH, MISSING_PAGES_PATH);
		reserved.put(WIKI_JOURNAL_PAGE_PATH, WIKI_JOURNAL_PAGE_PATH);

		catalogue.addPage(PAGES_INDEX_PAGE_PATH);
		catalogue.addPage(MISSING_PAGES_PATH);
		catalogue.addPage(WIKI_JOURNAL_PAGE_PATH);

		// globalLinks.put(PAGES_INDEX,PAGES_INDEX);
		// globalLinks.put(MISSING_PAGES,MISSING_PAGES);
		// globalLinks.put("WikiJournal","WikiJournal");
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

		attachFile(PAGES_INDEX_PAGE_PATH, PAGES_CATALOGUE_FILE, catalogue.toString(),
				false);
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * org.onestonesoup.wiki.controller.WikiControllerInterface#buildEditPage
	 * (java.lang.String, org.onestonesoup.authentication.server.Login)
	 */
	public String buildEditPage(String pageName, Login login)
			throws AuthenticationException {
		try {
			Map<String, String> values = getStandardTemplateData(pageName,
					"Edit | " + pageName,
					OpenForumNameHelper.titleToWikiName(login.getUser()
							.getName()),
					TimeHelper.getCurrentDisplayTimestamp());

			WikiLinkParser linkRenderer = new WikiLinkParser(pageName,
					EDIT_PAGE,
					"<font color=\"#FF0000\" face=\"Arial\">#</font>", this);
			// StringBuffer attachmentsHtml = linkRenderer.getAttachments(this);
			// values.put("attachments",attachmentsHtml.toString());

			String source = "";
			if (fileManager.pageExists(pageName, login)) {
				source = fileManager.getPageSourceAsString(pageName, login);
				if (source == null) {
					source = "";
				}
			}
			values.put("source", DataHelper.prepareTextForEditing(source));

			if (fileManager.pageAttachmentExists(pageName, TAGS_FILE, login)) {
				values.put("tags", fileManager.getPageAttachmentAsString(
						pageName, TAGS_FILE, login));
			} else {
				values.put("tags", "");
			}

			String pageEditForm = getPageEditForm(pageName, login);
			// String pageEditForm = fileManager.getPageInheritedFileAsString(
			// pageName,EDIT_FORM_HTML_TEMPLATE,OPEN_FORUM_DEFAULT_PAGE,login);

			EntityTree dataToFileMap = null;
			if (fileManager
					.pageAttachmentExists(pageName, DATA_MAP_FILE, login)) {
				dataToFileMap = fileManager.getPageAttachmentAsXml(pageName,
						DATA_MAP_FILE, login);
			} else if (fileManager.pageAttachmentExists(
					OPEN_FORUM_DEFAULT_PAGE_PATH, DATA_MAP_FILE, login)) {
				dataToFileMap = fileManager.getPageAttachmentAsXml(
						OPEN_FORUM_DEFAULT_PAGE_PATH, DATA_MAP_FILE, login);
			}
			if (dataToFileMap != null) {
				for (int loop = 0; loop < dataToFileMap.getChildren().size(); loop++) {
					EntityTree.TreeEntity mapping = dataToFileMap.getChildren()
							.get(loop);

					String from = mapping.getAttribute("from");
					String to = mapping.getAttribute("to");

					if (from == null || to == null) {
						continue;
					}

					if (fileManager.pageAttachmentExists(pageName, to, login)) {
						String fileData = fileManager
								.getPageAttachmentAsString(pageName, to, login);
						values.put(from,
								DataHelper.prepareTextForEditing(fileData));
					} else {
						values.put(from, "");
					}
				}
			}

			String headerTemplate = fileManager.getPageInheritedFileAsString(
					pageName, HEADER_HTML_TEMPLATE, OPEN_FORUM_DEFAULT_PAGE_PATH,
					systemLogin);
			String footerTemplate = fileManager.getPageInheritedFileAsString(
					pageName, FOOTER_HTML_TEMPLATE, OPEN_FORUM_DEFAULT_PAGE_PATH,
					systemLogin);

			getRequiredTemplateInserts(pageName, headerTemplate, values);
			getRequiredTemplateInserts(pageName, footerTemplate, values);

			return TemplateHelper.generateStringWithTemplate(headerTemplate
					+ pageEditForm + footerTemplate, values);
		} catch (Exception e) {
			return null;
		}
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
		while (name.charAt(0) == '/') {
			name = name.substring(1);
		}

		catalogue.addPage(name);

		String pageBuildScript = fileManager.getPageInheritedFileAsString(name,
				PAGE_BUILD_JS, OPEN_FORUM_DEFAULT_PAGE_PATH, systemLogin);

		if (fileManager.pageAttachmentExists(name, WIKI_FILE, systemLogin) == false
				&& pageBuildScript == null) {
			return null;
		}

		Map<String, String> localTemplateData = getStandardTemplateData(name,
				null, null, null);

		if (fileManager.pageAttachmentExists(name, TAGS_FILE, systemLogin)) {
			catalogue.setPageTags(name, fileManager.getPageAttachmentAsString(
					name, TAGS_FILE, systemLogin));
		}

		StringBuffer html = new StringBuffer();

		if (pageBuildScript != null) {
			try {
				html.append(runPageBuildScript(name, pageBuildScript));
			} catch (Throwable e) {
				html.append(StringHelper.arrayToString(
						ExceptionHelper.getTrace(e), "\n"));
			}
		} else {
			WikiLinkParser linkRenderer = new WikiLinkParser(name, EDIT_PAGE,
					EDIT_LINK_DISPLAY_TEMPLATE, this);

			localTemplateData.put("referringPages",
					buildReferencesForPage(name));
			localTemplateData.put("tags", buildTagsForPage(name));

			String header = fileManager.getPageInheritedFileAsString(name,
					HEADER_HTML_TEMPLATE, OPEN_FORUM_DEFAULT_PAGE_PATH, systemLogin);
			getRequiredTemplateInserts(name, header, localTemplateData);

			header = TemplateHelper.generateStringWithTemplate(header,
					localTemplateData);

			html.append(header);

			StringBuffer content = new StringBuffer();
			try {
				String data = fileManager.getPageSourceAsString(name,
						systemLogin);

				// data =
				// MaskHelper.generateStringWithTemplate(data,localTemplateData);
				Renderer.wikiToHtml(name, data, content, this, linkRenderer);
			} catch (Exception e) {
				html.append(StringHelper.arrayToString(
						ExceptionHelper.getTrace(e), "\n"));
			}
			html.append(START_CONTENT);
			html.append(content);
			html.append(END_CONTENT);

			String footer = fileManager.getPageInheritedFileAsString(name,
					FOOTER_HTML_TEMPLATE, OPEN_FORUM_DEFAULT_PAGE_PATH, systemLogin);
			getRequiredTemplateInserts(name, footer, localTemplateData);
			footer = TemplateHelper.generateStringWithTemplate(footer,
					localTemplateData);

			html.append(footer);

			if (fileManager.saveStringAsHtmlPage(html.toString(), name,
					systemLogin) == true) {
				fileManager.saveStringAsAttachment(content.toString(), name,
						FRAGMENT_FILE, systemLogin, false);
				fileManager.saveStringAsAttachment(content.toString(), name,
						PRINTABLE_FILE, systemLogin, false);

				pageChangeTrigger.triggerListeners(name, "Page Changed");
			}
		}

		catalogue.addPage(name);// Moved up
		if (buildRefersTo == true) {
			// buildReferencesForPage(name); //Not sure what this is present for
			buildReferringPages(name);

			String[] path = name.split("/");
			String parentPageName = "";
			for (int loop = 0; loop < (path.length - 1); loop++) {
				parentPageName = "/" + path[loop];
				buildPage(parentPageName, false);
			}
		}

		return html;
	}

	private String runPageBuildScript(String name, String script)
			throws Throwable {
		JavascriptEngine js = getJavascriptEngine(systemLogin);
		js.mount("pageName", name);

		return (js.evaluateJavascript(name + "/" + PAGE_BUILD_JS, script))
				.toString();
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * org.onestonesoup.wiki.controller.WikiControllerInterface#buildPage(java
	 * .lang.String, boolean)
	 */
	public String buildPageSection(String name, int section) throws Exception,
			AuthenticationException {
		StringBuffer html = new StringBuffer("");
		WikiLinkParser linkRenderer = new WikiLinkParser(name, EDIT_PAGE,
				EDIT_LINK_DISPLAY_TEMPLATE, this);

		Map<String, String> localTemplateData = getStandardTemplateData(name,
				name, SYSTEM_NAME, null);
		String data = fileManager.getPageSourceAsString(name, systemLogin);
		data = TemplateHelper.generateStringWithTemplate(data,
				localTemplateData);

		List<String> sections = new ArrayList<String>();
		Renderer.wikiToHtml(name, data, html, this, linkRenderer, sections);

		section--;
		if (section >= 0 && sections.size() < section) {
			return (String) sections.get(section);
		} else {
			return null;
		}
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see org.onestonesoup.wiki.controller.WikiControllerInterface#
	 * buildReferencesForPage(java.lang.String, boolean)
	 */
	public String buildReferencesForPage(String pageName) throws Exception,
			AuthenticationException {
		String[] excludes = getExcludesList(EXCLUDE_REFERENCES, pageName);

		StringBuffer references = new StringBuffer();
		EntityTree.TreeEntity referringPages = catalogue
				.getReferringPages(pageName);
		int count = 0;
		if (referringPages != null) {
			for (int loop = 0; loop < referringPages.getChildren().size(); loop++) {
				String title = referringPages.getChildren().get(loop)
						.getAttribute("title");

				if (isPageExcluded(excludes, title)) {
					continue;
				}

				if (title == pageName || title.equals(LEFT_MENU_PAGE_NAME)) {
					continue;
				}

				if (fileManager.pageExists(title, systemLogin) == false) {
					catalogue.removePage(title);
					continue;
				}
				count++;

				String displayName = title;
				if (displayName.indexOf('/') != -1) {
					displayName = displayName.substring(displayName
							.lastIndexOf('/') + 1);
				}
				references.append("<tr><td><a title='" + title + "' href='"
						+ title + "'>"
						+ StringHelper.truncate(displayName, 25, "...")
						+ "</a></td></tr>\n");
			}
		}
		if (count == 0) {
			references.append("<tr><td>NONE</td></tr>\n");
		}

		return references.toString();
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

	public void buildReferringPages(String pageName) throws Exception,
			AuthenticationException {
		String[] excludes = getExcludesList(EXCLUDE_REFERENCES, pageName);

		EntityTree.TreeEntity referringPages = catalogue
				.getReferringPages(pageName);
		if (referringPages != null) {
			for (int loop = 0; loop < referringPages.getChildren().size(); loop++) {
				String title = referringPages.getChildren().get(loop)
						.getAttribute("title");

				if (title == null || isPageExcluded(excludes, title)) {
					continue;
				}

				if (title == pageName || title.equals(LEFT_MENU_PAGE_NAME)) {
					continue;
				}

				if (fileManager.pageExists(title, systemLogin) == false) {
					catalogue.removePage(title);
					continue;
				}

				if (inReservedList(title) == false) {
					pageBuildQueue.addPageToBuild(title);
					// buildPage(title,false);
				}
			}
		}
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * org.onestonesoup.wiki.controller.WikiControllerInterface#buildTagsForPage
	 * (java.lang.String)
	 */
	public String buildTagsForPage(String pageName) {
		StringBuffer tags = new StringBuffer();
		EntityTree.TreeEntity pageTags = catalogue.getPageTags(pageName);
		int count = 0;
		if (pageTags != null) {
			for (int loop = 0; loop < pageTags.getChildren().size(); loop++) {
				String tag = pageTags.getChildren().get(loop).getValue();
				count++;
				tags.append("<tr><td><a href='/OpenForum/Actions/Search?searchTerm=tag:"
						+ tag + "'>" + tag + "</a></td></tr>\n");
			}
		}
		if (count == 0) {
			tags.append("<tr><td>NONE</td></tr>\n");
		}

		return tags.toString();
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
	 * org.onestonesoup.wiki.controller.WikiControllerInterface#getPageEditForm
	 * (java.lang.String)
	 */
	public String getPageEditForm(String pageName, Login login)
			throws Exception, AuthenticationException {
		String form = null;
		if (fileManager.pageAttachmentExists(pageName, EDIT_FORM_WIKI_TEMPLATE,
				systemLogin)) {
			form = fileManager.getPageAttachmentAsString(pageName,
					EDIT_FORM_WIKI_TEMPLATE, systemLogin);
			form = renderWikiData(pageName, form);
		} else if (fileManager.pageAttachmentExists(pageName,
				EDIT_FORM_HTML_TEMPLATE, systemLogin)) {
			form = fileManager.getPageAttachmentAsString(pageName,
					EDIT_FORM_HTML_TEMPLATE, systemLogin);
		}

		if (form != null) {
			try {

				Map<String, String> data = new HashMap<String, String>();
				if (fileManager.pageAttachmentExists(pageName, DATA_FILE,
						systemLogin)) {
					EntityTree dataXml = fileManager.getPageAttachmentAsXml(
							pageName, DATA_FILE, systemLogin);
					for (EntityTree.TreeEntity entity : dataXml.getChildren()) {
						data.put(entity.getName(), entity.getValue());
					}
				}
				data.put("pageName", pageName);

				EntityTree dataToFileMap = null;
				if (fileManager.pageAttachmentExists(pageName,
						"data-file-map.xml", systemLogin)) {
					dataToFileMap = fileManager.getPageAttachmentAsXml(
							pageName, DATA_MAP_FILE, systemLogin);
				} else if (fileManager.pageAttachmentExists(
						OPEN_FORUM_DEFAULT_PAGE_PATH, DATA_MAP_FILE, systemLogin)) {
					dataToFileMap = fileManager
							.getPageAttachmentAsXml(OPEN_FORUM_DEFAULT_PAGE_PATH,
									DATA_MAP_FILE, systemLogin);
				}
				if (dataToFileMap != null) {
					for (int loop = 0; loop < dataToFileMap.getChildren()
							.size(); loop++) {
						EntityTree.TreeEntity mapping = dataToFileMap
								.getChildren().get(loop);
						String from = mapping.getAttribute("from");
						String to = mapping.getAttribute("to");

						if (from == null || to == null) {
							continue;
						}

						if (fileManager.pageAttachmentExists(pageName, to,
								systemLogin)) {
							String fileData = fileManager
									.getPageAttachmentAsString(pageName, to,
											systemLogin);
							fileData = DataHelper
									.prepareTextForEditing(fileData);
							data.put(from, fileData);
						}
					}
				}
				getRequiredTemplateInserts(pageName, form, data);

				return TemplateHelper.generateStringWithTemplate(form, data);
			} catch (Exception e) {
				return null;
			}
		} else {
			return fileManager.getPageInheritedFileAsString(pageName,
					EDIT_FORM_HTML_TEMPLATE, OPEN_FORUM_DEFAULT_PAGE_PATH, login);
		}
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see org.onestonesoup.wiki.controller.WikiControllerInterface#
	 * getPageUpdateTemplate(java.lang.String,
	 * org.onestonesoup.authentication.server.Login)
	 */
	public String getPageUpdateTemplate(String pageName, Login login)
			throws Exception, AuthenticationException {
		if (fileManager.pageAttachmentExists(pageName, UPDATE_WIKI_TEMPLATE,
				login)) {
			try {
				return fileManager.getPageAttachmentAsString(pageName,
						UPDATE_WIKI_TEMPLATE, systemLogin);
			} catch (Exception e) {
				return null;
			}
		} else {
			return null;
		}
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * org.onestonesoup.wiki.controller.WikiControllerInterface#getCatalogue()
	 */
	public PagesCatalogue getCatalogue() {
		return catalogue;
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
	public void addJournalEntry(String entry) throws Exception,
			AuthenticationException {
		entry = HttpRequestHelper.getHttpDate(System.currentTimeMillis()) + " "
				+ entry + "\\\\\n";
		String dateStamp = new SimpleDateFormat("dd-MM-yyyy")
				.format(new Date());

		if (fileManager.pageExists(WIKI_JOURNAL_PAGE_PATH + "/blog/" + dateStamp
				+ "_00-00-00", systemLogin) == false) {
			fileManager.appendStringToPageSource(entry, WIKI_JOURNAL_PAGE_PATH + "/blog/"
					+ dateStamp + "_00-00-00", systemLogin);
			fileManager.appendStringToPageSource(
					"*[" + dateStamp + "|" + WIKI_JOURNAL_PAGE_PATH + "/blog/"
							+ dateStamp + "_00-00-00" + "]\n", WIKI_JOURNAL_PAGE_PATH,
					systemLogin);
			buildPage(WIKI_JOURNAL_PAGE_PATH, false);
			buildPage(WIKI_JOURNAL_PAGE_PATH + "/blog/" + dateStamp + "_00-00-00", false);
		} else {
			fileManager.appendStringToPageSource(entry, WIKI_JOURNAL_PAGE_PATH + "/blog/"
					+ dateStamp + "_00-00-00", systemLogin);

		}

		// buildPage(WIKI_JOURNAL,false);
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
			addJournalEntry("Page " + pageName + " deleted by [/Admin/Users/"
					+ login.getUser().getName() + "]");
		} catch (Exception ioe) {
		}

		EntityTree.TreeEntity referringPages = catalogue
				.getReferringPages(pageName);

		fileManager.deletePage(pageName, login);
		catalogue.removePage(pageName);

		if (referringPages != null) {
			for (int loop = 0; loop < referringPages.getChildren().size(); loop++) {
				String title = referringPages.getChildren().get(loop)
						.getAttribute("title");
				if (title != null) {
					buildPage(title, false);
				}
			}
		}

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
					+ "] deleted by [/Admin/Users/" + login.getUser().getName()
					+ "]");
		} catch (Exception ioe) {
		}

		fileManager.deleteAttachment(pageName, fileName, login);
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * org.onestonesoup.wiki.controller.WikiControllerInterface#buildDifferencesPage
	 * (java.lang.String, java.lang.String, java.lang.String)
	 */
	public StringBuffer buildDifferencesPage(String pageName, String version1,
			String version2) throws Exception, AuthenticationException {
		Map<String, String> localTemplateData = getStandardTemplateData(
				pageName, pageName + " | Version Differences", SYSTEM_NAME,
				TimeHelper.getCurrentDisplayTimestamp());

		String headerTemplate = fileManager.getPageInheritedFileAsString(
				pageName, HEADER_HTML_TEMPLATE, OPEN_FORUM_DEFAULT_PAGE_PATH,
				systemLogin);
		getRequiredTemplateInserts(pageName, headerTemplate, localTemplateData);

		String header = TemplateHelper.generateStringWithTemplate(
				headerTemplate, localTemplateData);
		StringBuffer html = new StringBuffer(header);

		html.append("<h3><a href=\"/" + pageName
				+ "\">Goto Current version of "
				+ OpenForumNameHelper.wikiNameToTitle(pageName) + "</a></h3>");
		html.append("<h3><a href=\"/OpenForum/Actions/Revert?pageName="
				+ pageName + "&version=" + version2
				+ "\">Revert to this version of "
				+ OpenForumNameHelper.wikiNameToTitle(pageName)
				+ "</a></h3><br/><br/>");

		PageVersion current = new PageVersion();
		current.reference = version1;
		PageVersion old = new PageVersion();
		old.reference = version2;

		String[] differences = fileManager.getVersionController()
				.getDifferences(old, current).split("\n");

		html.append("<table><tr><td class=\"content\">");

		String oldAttachment = "history"
				+ old.reference.substring(old.reference.lastIndexOf('/'));
		String oldSource = getFileManager().getPageAttachmentAsString(pageName,
				oldAttachment, getSystemLogin());
		String oldPage = renderWikiData(pageName, oldSource);

		html.append(oldPage);

		html.append("</td></tr></table><table><tr><td class=\"differencesNone\"><b><font color=\"red\">Removed</font>-<font color=\"green\">Added</font></b>");

		for (int loop = 0; loop < differences.length; loop++) {
			char changeType = differences[loop].charAt(0);
			if (changeType == '+') {
				html.append("<xmp class='differencesAdd'>"
						+ differences[loop].substring(1) + "</xmp>");
			} else if (changeType == '-') {
				html.append("<xmp class='differencesSub'>"
						+ differences[loop].substring(1) + "</xmp>");
			} else {
				html.append("<xmp class='differencesNone'>" + differences[loop]
						+ "</xmp>");
			}
		}
		html.append("</td></tr></table>");

		String footerTemplate = fileManager.getPageInheritedFileAsString(
				pageName, FOOTER_HTML_TEMPLATE, OPEN_FORUM_DEFAULT_PAGE_PATH,
				systemLogin);
		String footer = TemplateHelper.generateStringWithTemplate(
				footerTemplate, localTemplateData);
		html.append(footer);

		return html;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * org.onestonesoup.wiki.controller.WikiControllerInterface#buildHistoryPage
	 * (java.lang.String)
	 */
	public StringBuffer buildHistoryPage(String pageName) throws Exception,
			AuthenticationException {
		Map<String, String> localTemplateData = getStandardTemplateData(
				pageName, pageName + " | Page History", SYSTEM_NAME,
				TimeHelper.getCurrentDisplayTimestamp());

		String headerTemplate = fileManager.getPageInheritedFileAsString(
				pageName, HEADER_HTML_TEMPLATE, OPEN_FORUM_DEFAULT_PAGE_PATH,
				systemLogin);
		getRequiredTemplateInserts(pageName, headerTemplate, localTemplateData);

		String header = TemplateHelper.generateStringWithTemplate(
				headerTemplate, localTemplateData);
		StringBuffer html = new StringBuffer(header);

		String pageFile = pageName;
		html.append("<h3><a href=\"/" + pageName
				+ ".html\">Goto Current version of "
				+ OpenForumNameHelper.wikiNameToTitle(pageName)
				+ "</a></h3><br/><br/>");

		PageVersion[] versions = fileManager.getVersionController()
				.getVersions(pageFile);
		if (versions == null || versions.length == 0) {
			html.append("<br/><br/><b>No history for this page was found.</b><br/><br/>");
		} else {
			// html.append(
			// "<b><a href=\"Differences?page="+pageName+"&version2="+pageFile+"&version1="+versions[versions.length-1].reference+"\">Current Page</a></b> <br/>");
			for (int loop = (versions.length - 1); loop >= 1; loop--) {
				html.append("<b><a href=\"/OpenForum/Actions/Differences?pageName="
						+ pageName
						+ "&version1="
						+ versions[loop - 1].reference
						+ "&version2="
						+ versions[loop].reference
						+ "\">"
						+ versions[loop].message + "</a></b> <br/>");
			}
			html.append("<b><a href=\"/OpenForum/Actions/Differences?pageName="
					+ pageName + "&version1=" + versions[0].reference
					+ "&version2=" + versions[0].reference + "\">"
					+ versions[0].message + "</a></b> <br/>");
		}

		String footerTemplate = fileManager.getPageInheritedFileAsString(
				pageName, FOOTER_HTML_TEMPLATE, OPEN_FORUM_DEFAULT_PAGE_PATH,
				systemLogin);
		String footer = TemplateHelper.generateStringWithTemplate(
				footerTemplate, localTemplateData);
		html.append(footer);

		return html;
	}

	private EntityTree getDataSearchResults(String listPage, EntityTree params,
			Login login) throws Exception {
		listPage = OpenForumNameHelper.titleToWikiName(listPage);
		// EntityTree pages = catalogue.getPagesReferredTo(listPage);
		String[][] pages = DataHelper.getPageAsList(fileManager
				.getPageSourceAsString(listPage, login));

		EntityTree nonBlankParams = new EntityTree("params");
		for (int loop = 0; loop < params.getChildren().size(); loop++) {
			EntityTree.TreeEntity param = params.getChildren().get(loop);
			if (param.getName().charAt(0) != '_'
					&& param.getValue().length() > 0) {
				nonBlankParams.addChild(params.getChildren().get(loop));
			}
		}
		params = nonBlankParams;

		EntityTree matches = new EntityTree("matches");

		for (int loop = 0; loop < pages.length; loop++) {
			String pageName = pages[loop][1];

			InputStream dataStream = null;
			try {
				dataStream = fileManager.getAttachmentInputStream(pageName,
						DATA_FILE, systemLogin);
			} catch (Exception e) {
				continue;
			}

			EntityTree.TreeEntity data = XmlHelper.loadXml(dataStream, true)
					.getRoot();
			try {
				dataStream.close();
			} catch (Exception e) {
			}

			boolean match = true;
			for (int loopP = 0; loopP < params.getChildren().size(); loopP++) {
				EntityTree.TreeEntity param = params.getChildren().get(loopP);
				String paramValue = param.getValue();

				boolean matchState = true;
				if (paramValue.charAt(0) == '!') {
					matchState = true;
					paramValue = paramValue.substring(1);
				}

				boolean wildCardSearch = false;
				if (paramValue.charAt(0) == '*') {
					wildCardSearch = true;
					paramValue = paramValue.substring(1);
				}

				EntityTree.TreeEntity found = data.getChild(param.getName());
				if (found != null) {
					if (wildCardSearch) {
						if (matchState == true) {
							if (found.getValue().indexOf(paramValue) == -1) {
								match = false;
							}
						} else {
							if (found.getValue().indexOf(paramValue) != -1) {
								match = false;
							}
						}
					} else {
						if (matchState == true) {
							if (found.getValue().equals(paramValue) == false) {
								match = false;
							}
						} else {
							if (found.getValue().equals(paramValue)) {
								match = false;
							}
						}
					}
				} else {
					match = false;
				}
			}

			if (match == true) {
				EntityTree.TreeEntity page = matches.addChild("page");
				page.setAttribute("page", pageName);
				page.addChild(data);
			}
		}

		// XmlSort.sortElement(matches,"page/data/index");
		return matches;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see org.onestonesoup.wiki.controller.WikiControllerInterface#
	 * buildDataSearchResultPage(java.lang.String,
	 * org.onestonesoup.xml.EntityTree)
	 */
	public StringBuffer buildDataSearchResultPage(String listPage,
			EntityTree params, Login login) throws Exception {
		EntityTree matches = getDataSearchResults(listPage, params, login);

		Map<String, String> localTemplateData = getStandardTemplateData(
				SEARCH_RESULTS_PAGE_PATH, null, SYSTEM_NAME,
				TimeHelper.getCurrentDisplayTimestamp());

		String headerTemplate = fileManager.getPageInheritedFileAsString(
				SEARCH_RESULTS_PAGE_PATH, HEADER_HTML_TEMPLATE, OPEN_FORUM_DEFAULT_PAGE_PATH,
				systemLogin);
		getRequiredTemplateInserts(SEARCH_RESULTS_PAGE_PATH, headerTemplate,
				localTemplateData);
		String header = TemplateHelper.generateStringWithTemplate(
				headerTemplate, localTemplateData);
		StringBuffer html = new StringBuffer(header);

		if (matches.getChildren().size() == 0) {
			html.append("<b>No Matches Found</b>");
		} else {
			html.append("<table class=\"wikiTable\"><tr>");
			// html.append("<td class=\"wikiTableTitle\">&nbsp;</td>");
			EntityTree.TreeEntity matchParams = matches.getChildren().get(0)
					.getChildren().get(0);
			String[] titles = new String[matchParams.getChildren().size()];

			for (int loop = 0; loop < matchParams.getChildren().size(); loop++) {
				titles[loop] = matchParams.getChildren().get(loop).getName();

				if (matchParams.getChildren().get(loop).getName().charAt(0) == '_') {
					continue;
				}

				html.append("<td class=\"wikiTableTitle\"><b>"
						+ NameHelper.dataToTitleName(matchParams.getChildren()
								.get(loop).getName()) + "</b></td>");
			}
			html.append("</tr>\n");

			for (int loop = 0; loop < matches.getChildren().size(); loop++) {
				String cellClass = null;

				if (loop % 2 == 0) {
					cellClass = "wikiTableEvenRow";
				} else {
					cellClass = "wikiTableOddRow";
				}

				EntityTree.TreeEntity xMatch = matches.getChildren().get(loop);
				// html.append("<tr><td class=\""+cellClass+"\"><a href=\"/"+xMatch.getAttributeValueByName("page")+"\"><b>"+xMatch.getAttributeValueByName("page")+"</b></a></td>");
				EntityTree.TreeEntity values = xMatch.getChildren().get(0);
				for (int loopP = 0; loopP < matchParams.getChildren().size(); loopP++) {
					if (matchParams.getChildren().get(loopP).getName()
							.charAt(0) == '_') {
						continue;
					}

					EntityTree.TreeEntity xValue = values.getChild(matchParams
							.getChildren().get(loopP).getName());
					String value = "";
					if (xValue != null) {
						value = xValue.getValue();
					}

					if (titles[loopP].equals("pageName")) {
						value = xMatch.getAttribute("page");
						if (value.lastIndexOf('/') > 0) {
							value = value.substring(value.lastIndexOf('/') + 1);
						}
					}

					if (value.length() > 30) {
						value = value.substring(0, 27) + "...";
					}
					StringBuffer newValue = new StringBuffer();
					WikiLinkParser linkRenderer = new WikiLinkParser(
							"Search Results", EDIT_PAGE,
							EDIT_LINK_DISPLAY_TEMPLATE, this);
					Renderer.wikiToHtml("Search Results", value, newValue,
							this, linkRenderer);
					if (newValue.length() == 0) {
						newValue.append("&nbsp;");
					}

					if (titles[loopP].equals("pageName")) {
						// html.append("<tr><td class=\""+cellClass+"\"><a href=\"/"+xMatch.getAttributeValueByName("page")+"\"><b>"+xMatch.getAttributeValueByName("page")+"</b></a></td>");
						String href = xMatch.getAttribute("page");
						if (href.charAt(0) != '/') {
							href = "/" + href;
						}
						html.append("<td class=\"" + cellClass
								+ "\" nowrap=\"true\"><a href=\"" + href
								+ "\">" + value + "</a></td>");
					} else {
						html.append("<td class=\"" + cellClass
								+ "\" nowrap=\"true\">" + newValue.toString()
								+ "</td>");
					}
				}
				html.append("</tr>\n");
			}
			html.append("</table>");
		}
		String footerTemplate = fileManager.getPageInheritedFileAsString(
				SEARCH_RESULTS_PAGE_PATH, FOOTER_HTML_TEMPLATE, OPEN_FORUM_DEFAULT_PAGE_PATH,
				systemLogin);
		getRequiredTemplateInserts(SEARCH_RESULTS_PAGE_PATH, footerTemplate,
				localTemplateData);
		String footer = TemplateHelper.generateStringWithTemplate(
				footerTemplate, localTemplateData);

		html.append(footer);

		return html;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see org.onestonesoup.wiki.controller.WikiControllerInterface#
	 * buildDataSearchResultTable(java.lang.String,
	 * org.onestonesoup.xml.EntityTree)
	 */
	public StringBuffer buildDataSearchResultTable(String listPage,
			EntityTree params, Login login) throws Exception {
		EntityTree matches = getDataSearchResults(listPage, params, login);

		EntityTree.TreeEntity matchParams = matches.getChildren().get(0)
				.getChildren().get(0);
		int columns = 0;

		for (int loop = 0; loop < matchParams.getChildren().size(); loop++) {
			if (matchParams.getChildren().get(loop).getName().charAt(0) == '_') {
				continue;
			}
			columns++;
		}

		String[] columnNames = new String[columns];
		for (int x = 0; x < columns; x++) {
			columnNames[x] = "" + x;
		}
		EntityTable table = new EntityTable(columnNames);

		try {
			int columnCursor = 0;
			for (int loop = 0; loop < matchParams.getChildren().size(); loop++) {
				if (matchParams.getChildren().get(loop).getName().charAt(0) == '_') {
					continue;
				}
				table.getColumnDefinitions().setColumn(
						columnCursor,
						NameHelper.dataToTitleName(matchParams.getChildren()
								.get(loop).getName()));
				columnCursor++;
			}

			for (int loop = 0; loop < matches.getChildren().size(); loop++) {
				EntityTree.TreeEntity xMatch = matches.getChildren().get(loop);
				EntityTree.TreeEntity values = xMatch.getChildren().get(0);
				TableEntity row = table.addRow(new String[columns]);
				columnCursor = 0;
				for (int loopP = 0; loopP < matchParams.getChildren().size(); loopP++) {
					if (matchParams.getChildren().get(loopP).getName()
							.charAt(0) == '_') {
						continue;
					}

					EntityTree.TreeEntity xValue = values.getChild(matchParams
							.getChildren().get(loopP).getName());
					String value = "";
					if (xValue != null) {
						value = xValue.getValue();
					}
					if (value.length() > 30) {
						value = value.substring(0, 27) + "...";
					}
					if (value == null) {
						value = "";
					}
					value = value.replace('\r', ' ');
					value = value.replace('\n', ' ');

					row.setColumn(columnCursor, "\"" + value + "\"");
					columnCursor++;
				}
			}

			return new StringBuffer(CSVHelper.toCSV(table));
		} catch (Exception e) {
			return new StringBuffer(StringHelper.arrayToString(
					ExceptionHelper.getTrace(e), "\n"));
		}
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
			if (fileManager
					.pageAttachmentExists(pageName, DATA_MAP_FILE, login)) {
				dataToFileMap = fileManager.getPageAttachmentAsXml(pageName,
						DATA_MAP_FILE, login);
			} else if (fileManager.pageAttachmentExists(
					OPEN_FORUM_DEFAULT_PAGE_PATH, DATA_MAP_FILE, login)) {
				dataToFileMap = fileManager.getPageAttachmentAsXml(
						OPEN_FORUM_DEFAULT_PAGE_PATH, DATA_MAP_FILE, login);
			}
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
						+ "] changed by [/Admin/Users/" + author + "]");
			} else {
				addJournalEntry("Page [" + pageName
						+ "] added by [/Admin/Users/" + author + "]");
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
	 * org.onestonesoup.wiki.controller.WikiControllerInterface#savePage(java
	 * .lang.String, java.lang.String, org.onestonesoup.xml.EntityTree,
	 * org.onestonesoup.authentication.server.Login)
	 */
	public void savePage(String pageName, String updateTemplate,
			EntityTree.TreeEntity data, Login login) throws Exception,
			AuthenticationException {
		pageName = OpenForumNameHelper.titleToWikiName(pageName);
		Map<String, String> dataTable = new HashMap<String, String>();
		for (EntityTree.TreeEntity entity : data.getChildren()) {
			dataTable.put(entity.getName(), entity.getValue());
		}
		String source = TemplateHelper.generateStringWithTemplate(
				updateTemplate, dataTable);

		EntityTree dataToFileMap = null;
		if (fileManager.pageAttachmentExists(pageName, DATA_MAP_FILE, login)) {
			dataToFileMap = fileManager.getPageAttachmentAsXml(pageName,
					DATA_MAP_FILE, login);
		} else if (fileManager.pageAttachmentExists(OPEN_FORUM_DEFAULT_PAGE_PATH,
				DATA_MAP_FILE, login)) {
			dataToFileMap = fileManager.getPageAttachmentAsXml(
					OPEN_FORUM_DEFAULT_PAGE_PATH, DATA_MAP_FILE, login);
		}
		if (dataToFileMap != null) {
			for (int loop = 0; loop < dataToFileMap.getChildren().size(); loop++) {
				EntityTree.TreeEntity mapping = dataToFileMap.getChildren()
						.get(loop);
				String from = mapping.getAttribute("from");
				String to = mapping.getAttribute("to");

				EntityTree.TreeEntity fromData = data.getChild(from);
				if (fromData != null) {
					fileManager.saveStringAsAttachment(fromData.getValue(),
							pageName, to, login, true);
					fromData.setValue("&" + from + ";");
				}
			}
		}

		fileManager.saveStringAsAttachment(
				XmlHelper.toXml(new EntityTree(data)), pageName, DATA_FILE,
				login, true);
		fileManager.saveStringAsPageSource(source, pageName, login);

		EntityTree.TreeEntity tags = data.getChild("tags");
		if (tags != null) {
			fileManager.saveStringAsAttachment(tags.getValue(), pageName,
					TAGS_FILE, login, true);
		}

		String author = OpenForumNameHelper.titleToWikiName(login.getUser()
				.getName());
		try {
			if (fileManager.pageExists(pageName, login)) {
				addJournalEntry("Page [" + pageName
						+ "] changed by [/Admin/Users/" + author + "]");
			} else {
				addJournalEntry("Page [" + pageName
						+ "] added by [/Admin/Users/" + author + "]");
			}
		} catch (Exception ioe) {
		}

		String owner = fileManager.getPageAttachmentAsString(pageName,
				OWNER_FILE, getSystemLogin());

		if (owner == null) {
			fileManager.saveStringAsAttachment(author, pageName, OWNER_FILE,
					login, false);
		} else if (author.equals("Admin") == false) {
			fileManager.saveStringAsAttachment(author, pageName, OWNER_FILE,
					login, false);
		}
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
		// boolean requiresIndex = false;

		// If page has a data.xml file and it has an element index, update the
		// index value
		if (getFileManager()
				.pageAttachmentExists(newPageName, DATA_FILE, login)) {
			EntityTree data = getFileManager().getPageAttachmentAsXml(
					newPageName, DATA_FILE, login);

			if (data.getChild("index") != null) {
				int index = updateListPage(newPageName, listPage, login, true);
				data.getChild("index").setValue("" + index);
				attachFile(newPageName, DATA_FILE, XmlHelper.toXml(data), true);
			} else {
				updateListPage(newPageName, listPage, login, false);
			}
		} else {
			updateListPage(newPageName, listPage, login, false);
		}

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

				EntityTree indexValue = getFileManager()
						.getPageAttachmentAsXml(listPageName, INDEX_FILE, login);
				index = Integer.parseInt(indexValue.getValue());
				indexValue.setValue("" + (index + 1));

				attachFile(listPageName, INDEX_FILE,
						XmlHelper.toXml(indexValue), false);
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
											"page.wiki", login);
							String tags = getFileManager()
									.getPageAttachmentAsString(
											pageName + "/" + fileName,
											"page.wiki", login);
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

	public void getRequiredTemplateInserts(String pageName, String template,
			Map<String, String> templateData) {
		try {
			Set<String> list = TemplateHelper.generateListForTemplate(template);
			for (String item : list) {
				if (item.indexOf("insert:") == 0) {
					String insertPage = KeyValuePair
							.parseKeyAndValue(item, ":").getValue();

					if (insertPage.charAt(0) != '/') {
						insertPage = "/" + pageName + "/" + insertPage;
					}
					String file = WIKI_FILE;
					String ext = FileHelper.getExtension(insertPage);
					if (ext.length() > 0) {
						file = insertPage
								.substring(insertPage.lastIndexOf("/"));
						insertPage = insertPage.substring(0,
								insertPage.lastIndexOf("/"));

						insertPage = fileManager.getPageInheritedFileAsString(
								insertPage, file, OPEN_FORUM_DEFAULT_PAGE_PATH,
								systemLogin);
					} else {
						StringBuffer content = new StringBuffer();
						try {
							String data = fileManager.getPageSourceAsString(
									insertPage, systemLogin);

							if (data != null) {
								data = TemplateHelper
										.generateStringWithTemplate(data,
												templateData);
								WikiLinkParser linkRenderer = new WikiLinkParser(
										insertPage, EDIT_PAGE,
										EDIT_LINK_DISPLAY_TEMPLATE, this);
								Renderer.wikiToHtml(pageName, data, content,
										this, linkRenderer);
							}
						} catch (Exception e) {
							content.append(StringHelper.arrayToString(
									ExceptionHelper.getTrace(e), "\n"));
						}
						insertPage = content.toString();

					}
					if (insertPage == null) {
						insertPage = "";
					} else {
						getRequiredTemplateInserts(pageName, insertPage,
								templateData);
					}

					templateData.put(item, insertPage);
				}
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
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

	public List<KeyValuePair> getSecurePagesList() throws Exception {
		return securePages.getList();
	}

	public String getAliasLink(String alias) throws Exception {
		return (String) aliasList.getHashList().get(alias);
	}

	public List<KeyValuePair> getAdminOnlyPagesList() throws Exception {
		return adminOnlyPages.getList();
	}

	public List<KeyValuePair> getLoginByIPAddressList() throws Exception {
		return loginByIPAddress.getList();
	}

	public List<KeyValuePair> getParameterRedirectList() throws Exception {
		return parameterRedirectList.getList();
	}
	
	public List<KeyValuePair> getNonSecurePagesList() throws Exception {
		return nonSecurePages.getList();
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
				getCatalogue(), getFileManager(), login);
		JavascriptOpenForumHelper wikiHelper = new JavascriptOpenForumHelper(
				this, login);
		JavascriptExternalResourceHelper externalHelper = new JavascriptExternalResourceHelper(
				getFileManager(), login);
		JavascriptFileHelper fileHelper = new JavascriptFileHelper(this, login);
		js.mount("JSON", new JSON(js));
		js.mount("js", jsHelper);
		js.mount("wiki", wikiHelper);
		js.mount("external", externalHelper);
		js.mount("file", fileHelper);
		js.mount("log", logger);

		return js;
	}

	public void setLogging(String pageName) {
		// TODO
		// router.setLogger(new WikiRouterMonitor(pageName));
	}

	public Map<String, String> getMimeTypes() {
		return mimeTypes;
	}

	public String startJavascript() throws Throwable {
		String id = "jsThread." + generateUniqueId();
		queueManager.getQueue("queue." + id);

		JavascriptEngine engine = new JavascriptEngine();
		engine.startJavascript(id, "", true);
		return null;
	}

	public void runScript(String scriptId) {
		// TODO Auto-generated method stub

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
					+ version + " by [/Admin/Users/"
					+ login.getUser().getName() + "]");
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
	 * @see org.onestonesoup.wiki.file.manager.FileManager#updateJarManager()
	 */
	public void updateJarManager() throws Throwable {
		jarManager.clearAllAPIs();
		jarManager.updateClassPath();
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * org.onestonesoup.wiki.file.manager.FileManager#getApi(java.lang.String)
	 */
	public Object getApi(String pageName) throws Throwable {
		return jarManager.getApi(pageName);
	}

	public void initialise() throws IOException, AuthenticationException {
		try {
			updateJarManager();

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

			logger.info("Building Wiki Catalogue");
			EntityTree catalogueXml = fileManager.getPageAttachmentAsXml(
					PAGES_INDEX_PAGE_PATH, PAGES_CATALOGUE_FILE, getSystemLogin());
			catalogue = new PagesCatalogue(this, catalogueXml);
			logger.info("Built Wiki Catalogue");

			logger.info("Building Wiki Page Build Queue");
			pageBuildQueue = new OpenForumPageBuildQueue(this);
			logger.info("Built Wiki Page Build Queue");

			logger.info("Building Wiki Page List");
			buildPagesList();
			logger.info("Built Wiki Page List");

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

	public Logger getLogger() {
		return logger;
	}
}