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
	public static final String CONTENT_FILE = "page.content";
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
	public static final String TOP_MENU_PAGE_NAME = "TopMenu";

	public static final String DEFAULT_HOME_PAGE_PATH = "/OpenForum/HomePage";
	public static final String MISSING_PAGES_PATH = "/OpenForum/MissingPages";
	public static final String PAGES_INDEX_PAGE_PATH = "/OpenForum/PagesIndex";
	public static final String OPEN_FORUM_DEFAULT_PAGE_PATH = "/OpenForum/PageTemplates/Default";
	public static final String JOURNAL_PAGE_PATH = "/OpenForum/Journal";
	public static final String DELETED_PAGES = "/OpenForum/DeletedPages/";
	
	public static final String OPEN_FORUM_ALIASES = "/OpenForum/Configuration/Aliases";
	public static final String OPEN_FORUM_PARAMETER_REDIRECT_LIST = "/OpenForum/Configuration/ParameterRedirectList";
	public static final String OPEN_FORUM_DYNAMIC_PAGES = "/OpenForum/Configuration/DynamicPages";
	
	public static final String PAGE_404_PATH = "/OpenForum/ErrorPages/404/";
	public static final String PAGE_401_PATH = "/OpenForum/ErrorPages/401/";
	public static final String PAGE_500_PATH = "/OpenForum/ErrorPages/500/";
	public static final String PAGE_503_PATH = "/OpenForum/ErrorPages/503/";
	

}
