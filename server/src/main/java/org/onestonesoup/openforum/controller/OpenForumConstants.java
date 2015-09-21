package org.onestonesoup.openforum.controller;

public interface OpenForumConstants {

	public static final String SYSTEM_NAME = "OpenForum System";
	public static final String SERVER_VERSION = "${project.version}"; //Populated my Maven
	
	public static final String DATA_FILE = "data.json"; //TODO code to use json - To be marker as OpenForum page
	public static final String DATA_MAP_FILE = "data-file-map.json"; //TODO move to data.json
	public static final String LINKS_FILE = "links.txt"; //TODO move to data.json
	public static final String INDEX_FILE = "index.json"; //TODO Remove this
	public static final String OWNER_FILE = "owner.txt"; //TODO move to data.json
	public static final String TAGS_FILE = "tags.txt"; //TODO move to data.json
	public static final String PRINTABLE_FILE = "printable.html"; //TODO remove this
	public static final String PAGE_FILE = "page.html";
	public static final String WIKI_FILE = "page.wiki"; //TODO change to page.content in a move away from wiki
	public static final String PAGE_BUILD_JS = "page.build.js";
	public static final String GET_SJS_FILE = "get.sjs";
	public static final String POST_SJS_FILE = "post.sjs";
	public static final String HOOK_SJS = "hook.sjs";
	public static final String TRIGGER_SJS = "trigger.sjs";
	public static final String UPDATE_WIKI_TEMPLATE = "update.wiki.template"; // TODO remove this
	
	public static final String EDIT_FORM_HTML_TEMPLATE = "edit-form.html.template";
	public static final String EDIT_FORM_WIKI_TEMPLATE = "edit-form.wiki.template";
	
	public static final String EDIT_LINK_DISPLAY_TEMPLATE = "<font color=\"red\" face=\"Arial\">#</font><img border=\"0\" src=\"/OpenForum/Images/icons/gif/layout_edit.gif\"/>";
	public static final String EDIT_PAGE = "/OpenForum/Editor?pageName=";
	public static final String START_CONTENT = "<!--Start Content-->";
	public static final String END_CONTENT = "<!--End Content-->";
	
	public static final String FOOTER_HTML_TEMPLATE = "footer.html.template";
	public static final String FRAGMENT_FILE = "page.html.fragment";
	public static final String HEADER_HTML_TEMPLATE = "header.html.template";
	
	public static final String LEFT_MENU_PAGE_NAME = "LeftMenu";

	public static final String DEFAULT_HOME_PAGE_PATH = "/OpenForum/Home"; //Moved
	public static final String MISSING_PAGES_PATH = "/OpenForum/MissingPages"; //Moved
	public static final String PAGES_INDEX_PAGE_PATH = "/OpenForum/PagesIndex"; //Moved
	public static final String OPEN_FORUM_DEFAULT_PAGE_PATH = "/OpenForum/Page";
	public static final String WIKI_JOURNAL_PAGE_PATH = "/OpenForum/WikiJournal"; //Moved


	public static final String PAGE_404_PATH = "/OpenForum/404/";
	public static final String PAGE_401_PATH = "/OpenForum/401/";
	public static final String PAGE_500_PATH = "/OpenForum/500/";

}
