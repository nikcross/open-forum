package org.onestonesoup.openforum.filemanager;

import java.io.InputStream;
import java.io.OutputStream;
import java.net.URLDecoder;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;

import org.onestonesoup.core.FileHelper;
import org.onestonesoup.core.StringHelper;
import org.onestonesoup.core.TemplateHelper;
import org.onestonesoup.core.data.EntityTree;
import org.onestonesoup.core.data.XmlHelper;
import org.onestonesoup.openforum.DataHelper;
import org.onestonesoup.openforum.OpenForumException;
import org.onestonesoup.openforum.OpenForumNameHelper;
import org.onestonesoup.openforum.Stream;
import org.onestonesoup.openforum.TimeHelper;
import org.onestonesoup.openforum.controller.OpenForumConstants;
import org.onestonesoup.openforum.controller.OpenForumController;
import org.onestonesoup.openforum.plugin.JarManager;
import org.onestonesoup.openforum.security.AuthenticationException;
import org.onestonesoup.openforum.security.Authorizer;
import org.onestonesoup.openforum.security.Login;
import org.onestonesoup.openforum.security.User;
import org.onestonesoup.openforum.trigger.PageChangeTrigger;
import org.onestonesoup.openforum.versioncontrol.PageVersion;
import org.onestonesoup.openforum.versioncontrol.VersionController;
import org.onestonesoup.openforum.zip.UnZipper;
import org.onestonesoup.openforum.zip.Zipper;

public class FileManager implements OpenForumConstants {

	private long lastFileSaved = 0;

	private OpenForumController controller;
	private ResourceFolder root;
	private VersionController versionController;
	private PageChangeTrigger pageChangeTrigger;
	private ResourceStore resourceStore;

	public FileManager(String domainName,
			PageChangeTrigger pageChangeTrigger, OpenForumController controller)
			throws Exception {
		this.controller = controller;
		this.pageChangeTrigger = pageChangeTrigger;
	}

	// Version Control

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * org.onestonesoup.wiki.file.manager.FileManager#getVersionController()
	 */
	public VersionController getVersionController() {
		return versionController;
	}

	// End Version Control

	public ResourceStore getResourceStore(Login login) {
		return resourceStore;
	}

	private void backup(String pageName,String fileName,Login login) throws AuthenticationException, Exception {
		if (versionController != null && attachmentExists(pageName, fileName, login)) {
			versionController.backup(pageName + "/" + fileName, login
					.getUser().getName(), "Saved");
		}
	}
	
	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * org.onestonesoup.wiki.file.manager.FileManager#getPageSourceAsString(
	 * java.lang.String, org.onestonesoup.authentication.server.Login)
	 */
	public String getPageSourceAsString(String pageName, Login login)
			throws Exception, AuthenticationException {
		Resource file = getFile(pageName, "page.wiki", login);
		if (file == null) {
			System.err.println("FileManager.getPageSourceAsString("+pageName+") Resource does not exist.");
			return null;
		}
		return readFile(file);
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * org.onestonesoup.wiki.file.manager.FileManager#getPageAsString(java.lang
	 * .String, org.onestonesoup.authentication.server.Login)
	 */
	public String getPageAsString(String pageName, Login login)
			throws Exception, AuthenticationException {
		return readFile(getFile(pageName, "page.html", login));
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * org.onestonesoup.wiki.file.manager.FileManager#getPageTimeStamp(java.
	 * lang.String, org.onestonesoup.authentication.server.Login)
	 */
	public long getPageTimeStamp(String pageName, Login login)
			throws Exception, AuthenticationException {
		ResourceFolder folder = getFolder(pageName, false, login);

		if (folder == null) {
			return -1;
		} else {
			return resourceStore.lastModified(folder);
		}
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * org.onestonesoup.wiki.file.manager.FileManager#getAttachmentTimeStamp
	 * (java.lang.String, java.lang.String,
	 * org.onestonesoup.authentication.server.Login)
	 */
	public long getAttachmentTimeStamp(String pageName, String fileName,
			Login login) throws Exception, AuthenticationException {
		Resource file = getFile(pageName, fileName, login);

		if (file == null) {
			return -1;
		} else {
			return resourceStore.lastModified(file);
		}
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * org.onestonesoup.wiki.file.manager.FileManager#getAttachmentSize(java
	 * .lang.String, java.lang.String,
	 * org.onestonesoup.authentication.server.Login)
	 */
	public long getAttachmentSize(String pageName, String fileName, Login login)
			throws Exception, AuthenticationException {
		Resource file = getFile(pageName, fileName, login);

		if (file == null) {
			return -1;
		} else {
			return resourceStore.getLength(file);
		}
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * org.onestonesoup.wiki.file.manager.FileManager#getAttachmentSize(java
	 * .lang.String, org.onestonesoup.authentication.server.Login)
	 */
	public long getAttachmentSize(String attachment, Login login)
			throws Exception, AuthenticationException {
		String pageName = attachment.substring(0, attachment.lastIndexOf('/'));
		String fileName = attachment.substring(attachment.lastIndexOf('/') + 1);

		return getAttachmentSize(pageName, fileName, login);
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * org.onestonesoup.wiki.file.manager.FileManager#pageExists(java.lang.String
	 * , org.onestonesoup.authentication.server.Login)
	 */
	public boolean pageExists(String pageName, Login login) throws Exception {
		try {
			Resource file = getFile(pageName, "page.wiki", login);
			if (file == null) {
				return false;
			}
			if (file.getName().equals("history")
					|| file.getName().equals("blog")) {
				return false;
			}
			// return getFile(pageName,"page.wiki",login).exists();
			ResourceFolder pageFolder = getFolder(pageName, false, login);
			if (pageFolder == null) {
				return false;
			} else if (pageFolder.getName().equals("history")
					|| pageFolder.getName().equals("blog")) {
				return false;
			} else {
				return true;
			}
		} catch (AuthenticationException e) {
			return false;
		}
	}

	public boolean folderExists(String pageName, Login login)
			throws AuthenticationException, Exception {
		if (getFolder(pageName, false, login) == null) {
			return false;
		} else {
			return true;
		}
	}

	public boolean attachmentExists(String fileName, Login login)
			throws AuthenticationException, Exception {
		if (fileName.lastIndexOf('/') <= 0) {
			return false;
		} else {
			String pageName = fileName.substring(0, fileName.lastIndexOf('/'));
			fileName = fileName.substring(fileName.lastIndexOf('/') + 1);

			return attachmentExists(pageName, fileName, login);
		}
	}

	public boolean attachmentExists(String pageName, String fileName,
			Login login) throws AuthenticationException, Exception {
		if (getFile(pageName, fileName, login) == null) {
			return false;
		} else {
			return true;
		}
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * org.onestonesoup.wiki.file.manager.FileManager#getAuthorForPage(java.
	 * lang.String, org.onestonesoup.authentication.server.Login)
	 */
	public String getAuthorForPage(String pageName, Login login) {
		try {
			Resource file = getFile(pageName, OpenForumController.OWNER_FILE,
					login);
			if (file == null) {
				return "unknown";
			}
			String author = readFile(file);

			return author;
		} catch (Exception e) {
			e.printStackTrace();
			return "unknown";
		}
	}

	public Login getLoginForPageAuthor(String pageName, Login login) {
		String author = getAuthorForPage(pageName, login);
		if (author.equals("unknown")) {
			author = "Admin";
		}
		User owner = new User(author);
		Login ownerLogin = new Login();
		ownerLogin.setUser(owner);

		return ownerLogin;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * org.onestonesoup.wiki.file.manager.FileManager#getPageAttachments(java
	 * .lang.String, org.onestonesoup.authentication.server.Login)
	 */
	public Map<String, String> getPageAttachments(String pageName, Login login)
			throws Exception, AuthenticationException {
		Map<String, String> links = new HashMap<String, String>();

		ResourceFolder sourceFolder = null;
		try {
			sourceFolder = getFolder(pageName, false, login);
		} catch (AuthenticationException e) {
			return links;
		}
		if (sourceFolder == null) {
			return links;
		}
		Resource[] files = resourceStore.listResources(sourceFolder);

		for (int loop = 0; loop < files.length; loop++) {
			String name = files[loop].getName();

			name = name.substring(0, name.length());
			// name = name.replace('+',' ');
			name = URLDecoder.decode(name);

			// controller.getLogger().("\tAdding local link "+name+" as "+pageName+"/"+name);
			links.put(name, pageName + "/" + name);
		}

		ResourceFolder[] folders = resourceStore
				.listResourceFolders(sourceFolder);

		for (int loop = 0; loop < folders.length; loop++) {
			String name = folders[loop].getName();

			name = name.substring(0, name.length());
			// name = name.replace('+',' ');
			name = URLDecoder.decode(name);

			// controller.getLogger().("\tAdding local link "+name+" as "+pageName+"/"+name);
			links.put("+" + name, pageName + "/" + name);
		}

		return links;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * org.onestonesoup.wiki.file.manager.FileManager#getPageAttachmentAsInputStream
	 * (java.lang.String, java.lang.String,
	 * org.onestonesoup.authentication.server.Login)
	 */
	public InputStream getAttachmentInputStream(String pageName,
			String attachment, Login login) throws Exception,
			AuthenticationException {
		return resourceStore
				.getInputStream(getFile(pageName, attachment, login));
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * org.onestonesoup.wiki.file.manager.FileManager#getPageInheritedFileAsString
	 * (java.lang.String, java.lang.String, java.lang.String,
	 * org.onestonesoup.authentication.server.Login)
	 */
	public String getPageInheritedFileAsString(String pageName,
			String fileName, String defaultPageName, Login login)
			throws Exception, AuthenticationException {
		if (pageAttachmentExists(pageName, fileName, login)) {
			return getPageAttachmentAsString(pageName, fileName, login);
		}

		String[] parts = pageName.split("/");
		for (int loop = parts.length - 1; loop > 0; loop--) {
			String path = StringHelper.arrayToString(parts, "/", 0, loop);

			if (pageAttachmentExists(path, fileName, login)) {
				return getPageAttachmentAsString(path, fileName, login);
			}
		}

		if (pageAttachmentExists(defaultPageName, fileName, login)) {
			return getPageAttachmentAsString(defaultPageName, fileName, login);
		}

		return null;
	}

	public String getPageInheritedFilePath(String pageName, String fileName,
			String defaultPageName, Login login) throws Exception,
			AuthenticationException {
		if (pageAttachmentExists(pageName, fileName, login)) {
			return pageName;
		}

		String[] parts = pageName.split("/");
		for (int loop = parts.length - 1; loop > 0; loop--) {
			String path = StringHelper.arrayToString(parts, "/", 0, loop);

			if (pageAttachmentExists(path, fileName, login)) {
				return path;
			}
		}

		if (pageAttachmentExists(defaultPageName, fileName, login)) {
			return defaultPageName;
		}

		return null;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * org.onestonesoup.wiki.file.manager.FileManager#getPageAttachmentAsString
	 * (java.lang.String, java.lang.String,
	 * org.onestonesoup.authentication.server.Login)
	 */
	public String getPageAttachmentAsString(String pageName, String attachment,
			Login login) throws Exception, AuthenticationException {
		Resource file = getFile(pageName, attachment, login);
		if (file == null) {
			return null;
		} else {
			return readFile(file);
		}
	}

	public String getPageAttachmentAsString(String pageName, String attachment,
			Login login, boolean resolveLinks) throws Exception,
			AuthenticationException {
		Resource file = getFile(pageName, attachment, login, resolveLinks);
		if (file == null) {
			return null;
		} else {
			return readFile(file);
		}
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * org.onestonesoup.wiki.file.manager.FileManager#unZipPageAttachment(java
	 * .lang.String, java.lang.String,
	 * org.onestonesoup.authentication.server.Login)
	 */
	public void unZipPageAttachment(String pageName, String attachment,
			Login login) throws Exception, AuthenticationException {
		if (controller.getAuthorizer().isAuthorized(login, pageName,
				Authorizer.ACTION_UPDATE) == true) {
			Resource file = getFile(pageName, attachment, login);
			if (file == null) {
				return;
			}

			ResourceFolder targetFolder = null;
			if (file.getName().indexOf(".wiki.zip") == -1) { // If is not wiki.zip file, extract on requested page 
				targetFolder = getFolder(pageName, true, login);
			} else { // Else extract at root
				targetFolder = getFolder("", true, login);
			}

			UnZipper unzipper = new UnZipper(resourceStore.getInputStream(file));
			unzipper.unzipAll(resourceStore, targetFolder);
		} else {
			throw new AuthenticationException("No save rights");
		}
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * org.onestonesoup.wiki.file.manager.FileManager#zipPage(java.lang.String,
	 * org.onestonesoup.authentication.server.Login)
	 */
	public void zipPage(String pageName, Login login) throws Exception,
			AuthenticationException {
		if (controller.getAuthorizer().isAuthorized(login, Authorizer.ACTION_UPDATE,
				pageName) == true) {
			ResourceFolder folder = getFolder(pageName, false, login);
			if (folder == null) {
				return;
			}

			Zipper zipper = new Zipper(resourceStore.getOutputStream(folder,
					folder.getName() + ".wiki.zip"));
			zipper.zipAll(resourceStore, folder);
		} else {
			throw new AuthenticationException("No save rights");
		}
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * org.onestonesoup.wiki.file.manager.FileManager#pageAttachmentExists(java
	 * .lang.String, java.lang.String,
	 * org.onestonesoup.authentication.server.Login)
	 */
	public boolean pageAttachmentExists(String pageName, String attachment,
			Login login) throws Exception {
		try {
			Resource file = getFile(pageName, attachment, login);
			if (file == null) {
				return false;
			} else {
				return true;
			}
		} catch (NullPointerException ne) {
			return false;
		}
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * org.onestonesoup.wiki.file.manager.FileManager#getTimestampForAttachment
	 * (java.lang.String, org.onestonesoup.authentication.server.Login)
	 */
	public String getTimestampForAttachment(String attachment, Login login) {
		try {
			String pageName = attachment.substring(0,
					attachment.lastIndexOf('/'));
			String fileName = attachment
					.substring(attachment.lastIndexOf('/') + 1);

			long time = getAttachmentTimeStamp(pageName, fileName, login);
			Date date = new Date(time);
			return TimeHelper.getDisplayTimestamp(date);
		} catch (Exception ioe) {
			return "at an unspecified time.";
		}
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * org.onestonesoup.wiki.file.manager.FileManager#getTimestampForPage(java
	 * .lang.String, org.onestonesoup.authentication.server.Login)
	 */
	public String getTimestampForPage(String pageName, Login login) {
		try {
			long time = getPageTimeStamp(pageName, login);
			Date date = new Date(time);
			return TimeHelper.getDisplayTimestamp(date);
		} catch (Exception ioe) {
			return "at an unspecified time.";
		}
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * org.onestonesoup.wiki.file.manager.FileManager#getPageList(org.onestonesoup
	 * .authentication.server.Login)
	 */
	public List<String> getPageList(Login login) throws AuthenticationException {
		ArrayList<String> pages = new ArrayList<String>();

		pages.addAll(getPageList(root, "", login));

		return pages;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * org.onestonesoup.wiki.file.manager.FileManager#getPageList(java.io.File,
	 * java.lang.String, org.onestonesoup.authentication.server.Login)
	 */
	public List<String> getPageList(ResourceFolder folder, String prefix,
			Login login) {
		try {
			if( attachmentExists(folder.getPath(), "exclude.json", login) ) return new ArrayList<String>();
		} catch (AuthenticationException e) {
			e.printStackTrace();
			return new ArrayList<String>();
		} catch (Exception e) {
			e.printStackTrace();
			return new ArrayList<String>();
		}
		
		ResourceFolder[] list = resourceStore.listResourceFolders(folder);

		ArrayList<String> pages = new ArrayList<String>();
		for (int loop = 0; loop < list.length; loop++) {
			if (list[loop].getName().equals("history") == false
					&& list[loop].getName().equals("blog") == false) {
				pages.add(prefix + list[loop].getName());
			}

			pages.addAll(getPageList(list[loop], prefix + "/" + list[loop].getName(),
					login));
		}

		return pages;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * org.onestonesoup.wiki.file.manager.FileManager#appendStringToPageSource
	 * (java.lang.String, java.lang.String,
	 * org.onestonesoup.authentication.server.Login)
	 */
	public void appendStringToPageSource(String data, String pageName,
			Login login) throws Exception, AuthenticationException {
		if (controller.getAuthorizer().isAuthorized(login, pageName,
				Authorizer.ACTION_UPDATE) == true) {
			if (pageAttachmentExists(pageName, "page.wiki", login)) {
				resourceStore.appendResource(
						getFile(pageName, "page.wiki", login), data.getBytes());
			} else {
				saveStringAsAttachment(data, pageName, "page.wiki", login, true);
			}
			backup(pageName, "page.wiki", login);
		} else {
			throw new AuthenticationException("No save rights");
		}
	}

	public void appendStringToFile(String data, String pageName,
			String fileName, Login login) throws Exception,
			AuthenticationException {
		if (controller.getAuthorizer().isAuthorized(login, pageName,
				Authorizer.ACTION_UPDATE) == true) {
			if (pageAttachmentExists(pageName, fileName, login)) {
				resourceStore.appendResource(
						getFile(pageName, fileName, login), data.getBytes());
			} else {
				saveStringAsAttachment(data, pageName, fileName, login, true);
			}
			//backup(pageName, fileName, login);
		} else {
			throw new AuthenticationException("No save rights");
		}
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * org.onestonesoup.wiki.file.manager.FileManager#saveStringAsPageSource
	 * (java.lang.String, java.lang.String,
	 * org.onestonesoup.authentication.server.Login)
	 */
	public boolean saveStringAsPageSource(String data, String pageName,
			Login login) throws Exception, AuthenticationException {

		if (controller.getAuthorizer().isAuthorized(login, pageName,
				Authorizer.ACTION_UPDATE) == true) {
			String oldData = null;

			if (pageAttachmentExists(pageName, "page.wiki", login) == true) {
				oldData = getPageSourceAsString(pageName, login);
			}

			if (oldData != null && oldData.equals(data)) {
				return false;
			} else {
				saveFile(pageName, "page.wiki", data, login, true);
				return true;
			}
		} else {
			throw new AuthenticationException("No save rights");
		}
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * org.onestonesoup.wiki.file.manager.FileManager#saveStringAsHtmlPage(java
	 * .lang.String, java.lang.String,
	 * org.onestonesoup.authentication.server.Login)
	 */
	public boolean saveStringAsHtmlPage(String data, String pageName,
			Login login) throws Exception, AuthenticationException {
		if (controller.getAuthorizer().isAuthorized(login, pageName,
				Authorizer.ACTION_UPDATE) == true) {
			if (pageAttachmentExists(pageName, "page.html", login)) {
				String oldData = getPageAsString(pageName, login);
				if (oldData.equals(data)) {
					return false;
				}
			}
			saveFile(pageName, "page.html", data, login, false);
			return true;
		} else {
			throw new AuthenticationException("No save rights");
		}
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * org.onestonesoup.wiki.file.manager.FileManager#getAttachmentOutputStream
	 * (java.lang.String, java.lang.String,
	 * org.onestonesoup.authentication.server.Login)
	 */
	public OutputStream getAttachmentOutputStream(String pageName,
			String attachmentName, Login login) throws Exception,
			AuthenticationException {
		if (controller.getAuthorizer().isAuthorized(login, pageName,
				Authorizer.ACTION_UPDATE) == true) {
			backup(pageName, attachmentName, login);
			return resourceStore.getOutputStream(new Resource(resourceStore
					.getResourceFolder(pageName, true), attachmentName));
		} else {
			throw new AuthenticationException("No save rights");
		}
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * org.onestonesoup.wiki.file.manager.FileManager#saveStringAsAttachment
	 * (java.lang.String, java.lang.String, java.lang.String,
	 * org.onestonesoup.authentication.server.Login)
	 */
	public void saveStringAsAttachment(String data, String pageName,
			String attachmentName, Login login, boolean backup)
			throws Exception, AuthenticationException {
		if (controller.getAuthorizer().isAuthorized(login, pageName,
				Authorizer.ACTION_UPDATE) == true) {
			saveFile(pageName, attachmentName, data, login, backup);
		} else {
			throw new AuthenticationException("No save rights");
		}
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * org.onestonesoup.wiki.file.manager.FileManager#saveAsAttachment(byte[],
	 * java.lang.String, java.lang.String,
	 * org.onestonesoup.authentication.server.Login)
	 */
	public void saveAsAttachment(byte[] data, String pageName,
			String attachmentName, Login login) throws Exception,
			AuthenticationException {
		if (controller.getAuthorizer().isAuthorized(login, pageName,
				Authorizer.ACTION_UPDATE) == true) {
			saveFile(pageName, attachmentName, data, login, true);
		} else {
			throw new AuthenticationException("No save rights");
		}
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * org.onestonesoup.wiki.file.manager.FileManager#saveWikiStreamAsAttachment
	 * (org.onestonesoup.wiki.WikiStream, java.lang.String, java.lang.String,
	 * org.onestonesoup.authentication.server.Login)
	 */
	public long saveWikiStreamAsAttachment(Stream wikiStream, String pageName,
			String attachmentName, Login login) throws Exception,
			AuthenticationException {
		if (controller.getAuthorizer().isAuthorized(login, pageName,
				Authorizer.ACTION_UPDATE) == true) {
			
			long size = wikiStream.saveTo(resourceStore.getOutputStream(
					resourceStore.getResourceFolder(pageName, true),
					attachmentName));

			backup(pageName, attachmentName, login);

			/*
			 * if(size>0 && WikiAttachmentHelper.isImage(attachmentName) ) {
			 * String extension = FileNameHelper.getExt(attachmentName); String
			 * thumbnailName =
			 * attachmentName.substring(0,attachmentName.length()
			 * -(extension.length()+1)); thumbnailName =
			 * thumbnailName+".thumbnail.png"; new ThumbNailMaker(
			 * root.getAbsolutePath()+"/"+pageName+"/"+attachmentName,
			 * root.getAbsolutePath()+"/"+pageName+"/"+thumbnailName, "PNG",
			 * 200,200, true );
			 * 
			 * String iconName =
			 * attachmentName.substring(0,attachmentName.length
			 * ()-(extension.length()+1)); iconName = iconName+".icon.png"; new
			 * ThumbNailMaker(
			 * root.getAbsolutePath()+"/"+pageName+"/"+attachmentName,
			 * root.getAbsolutePath()+"/"+pageName+"/"+iconName, "PNG", 20,20,
			 * true ); }
			 */
			pageChangeTrigger.triggerListeners(pageName, "Saved Attachment "
					+ attachmentName);

			markLastSaved();
			return size;
		} else {
			throw new AuthenticationException("No save rights");
		}
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * org.onestonesoup.wiki.file.manager.FileManager#copyAttachment(java.lang
	 * .String, java.lang.String, java.lang.String,
	 * org.onestonesoup.authentication.server.Login)
	 */
	public void copyAttachment(String fileName, String sourcePageName,
			String targetPageName, Login login) throws Exception,
			AuthenticationException {
		copyAttachment(fileName, sourcePageName, fileName, targetPageName, login);
	}

	public void copyAttachment(String sourceFileName, String sourcePageName,
			String targetFileName, String targetPageName, Login login)
			throws Exception, AuthenticationException {
		if (controller.getAuthorizer().isAuthorized(login, targetPageName,
				Authorizer.ACTION_UPDATE) == true) {
			Resource source = getFile(sourcePageName + "/" + sourceFileName,
					login);
			ResourceFolder targetFolder = getFolder(targetPageName, false,
					login);

			resourceStore.copy(source, targetFolder, targetFileName);
			backup(targetPageName, targetPageName, login);
		} else {
			throw new AuthenticationException("No save rights");
		}
	}

	public void copyPage(String sourcePageName, String targetPageName,
			Login login) throws Exception, AuthenticationException {
		if (controller.getAuthorizer().isAuthorized(login, targetPageName,
				Authorizer.ACTION_UPDATE) == true) {
			ResourceFolder sourceFolder = getFolder(sourcePageName, false,
					login);
			ResourceFolder targetFolder = getFolder(targetPageName, false,
					login);

			resourceStore.copy(sourceFolder, targetFolder);
		} else {
			throw new AuthenticationException("No save rights");
		}
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * org.onestonesoup.wiki.file.manager.FileManager#deletePage(java.lang.String
	 * , org.onestonesoup.authentication.server.Login)
	 */
	public void deletePage(String pageName, Login login) throws Exception,
			AuthenticationException, OpenForumException {
		if (controller.getAuthorizer().isAuthorized(login, pageName,
				Authorizer.ACTION_UPDATE) == true) {
			ResourceFolder folder = getFolder(pageName, false, login);// getFileForRequest("/"+pageName);
			if (folder == null) {
				return;
			}

			if (pageName.indexOf(DELETED_PAGES) == 0) {
				resourceStore.delete(folder);
			} else {
				ResourceFolder newFolder = getFolder(DELETED_PAGES
						+ pageName, true, login);// getFileForRequest("/Admin/Deleted/"+pageName);

				if (newFolder != null) {
					resourceStore.delete(newFolder);
				}

				boolean result = resourceStore.move(folder, newFolder);
				if (result == false) {
					throw new OpenForumException(
							"Failed to move page <a href=\""
									+ pageName
									+ "\">"
									+ pageName
									+ "</a> to deleted folder <a href=\""+DELETED_PAGES+"\">"+DELETED_PAGES+"</a>.");
				}
			}

			pageChangeTrigger.triggerListeners(pageName, "Deleted Page");
		} else {
			throw new AuthenticationException("No delete rights");
		}
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * org.onestonesoup.wiki.file.manager.FileManager#deleteAttachment(java.
	 * lang.String, java.lang.String,
	 * org.onestonesoup.authentication.server.Login)
	 */
	public void deleteAttachment(String pageName, String fileName, Login login)
			throws Exception, AuthenticationException {
		deleteAttachment(pageName, fileName, true, login);
	}

	public void deleteAttachment(String pageName, String fileName,
			boolean backup, Login login) throws Exception,
			AuthenticationException {
		if (controller.getAuthorizer().isAuthorized(login, pageName,
				Authorizer.ACTION_DELETE) == true) {
			if (backup == true) {
				Resource file = getFile(pageName, fileName, login, false);
				ResourceFolder newFolder = getFolder(DELETED_PAGES, true,
						login);
				newFolder = getFolder(DELETED_PAGES + pageName, true, login);
				resourceStore.move(file, newFolder, fileName);
			} else {
				Resource file = getFile(pageName, fileName, login, false);
				resourceStore.delete(file);
			}
			pageChangeTrigger.triggerListeners(pageName, "Deleted Attachment "
					+ fileName);
		} else {
			throw new AuthenticationException("No delete rights");
		}
	}

	/*
	 * public boolean serveFile(String request,EntityTree httpHeader,Socket
	 * socket) throws Exception { File file = getFileForRequest( request );
	 * if(file.exists()==false) { return false; }
	 * 
	 * FileHelper.copy(file.getAbsolutePath(),socket.getOutputStream(),null);
	 * 
	 * return true; }
	 */
	public ResourceFolder getFolder(String pageName, boolean mkdirs, Login login)
			throws Exception, AuthenticationException {
		ResourceFolder folder = resourceStore.getResourceFolder(pageName,
				mkdirs);
		if (folder != null) {
			if (controller.getAuthorizer().isAuthorized(login, pageName,
					Authorizer.ACTION_READ) == false) {
				throw new AuthenticationException("No Access to " + pageName);
			}

			return folder;
		} else {
			return null;
		}
	}

	private Resource getFile(String request, Login login) throws Exception,
			AuthenticationException {
		return getFile(request, login, true);
	}

	private Resource getFile(String request, Login login, boolean resolveLinks)
			throws Exception, AuthenticationException {
		if (request.indexOf("/") != -1) {
			String pageName = request.substring(0, request.lastIndexOf("/"));
			String fileName = request.substring(request.lastIndexOf("/") + 1);

			return getFile(pageName, fileName, login, resolveLinks);
		}
		return getFile(request, null, login, resolveLinks);
	}

	public Resource getFile(String pageName, String fileName, Login login)
			throws Exception, AuthenticationException {
		return getFile(pageName, fileName, login, true);
	}

	public Resource getFile(String pageName, String fileName, Login login,
			boolean resolveLinks) throws Exception, AuthenticationException {
		if (pageName.length() > 0 && pageName.charAt(0) != '/'
				&& pageName.charAt(0) != '.') {
			pageName = "/" + pageName;
		}
		if (pageName.indexOf(".html") != -1) {
			pageName = pageName.substring(0, pageName.indexOf(".html"));
		}
		String originalPageName = pageName;
		pageName = OpenForumNameHelper.titleToWikiName(pageName);

		String request = pageName;
		if (fileName != null) {
			request = pageName + "/" + fileName;
		}

		// String rootPath = root.getPath();

		if (resourceStore.isResourceFolder(pageName) == false) {
			if (resourceStore.isResourceFolder(originalPageName)) {
				pageName = originalPageName;
				request = pageName;
				if (fileName != null) {
					request = pageName + "/" + fileName;
				}
			} else {
				return null;
			}
		}

		if (request.indexOf("..") != -1) {
			String[] path = request.replace('\\', '/').split("/");
			int level = 0;
			for (int loop = 0; loop < path.length; loop++) {
				if (path[loop].equals("..")) {
					level--;
				} else {
					level++;
				}
			}

			if (level < 0) {
				throw new Exception(request + " not below root");
			}
		}

		if (!(login==controller.getSystemLogin()) && controller.getAuthorizer().isAuthorized(login, pageName,
				Authorizer.ACTION_READ) == false) {
			throw new AuthenticationException("No Access to " + pageName);
		}

		String extension = FileHelper.getExtension(request);

		Resource requestFile = resourceStore.getResource(request);
		if (resolveLinks == true && extension.equals("link")) {
			request = FileHelper.loadFileAsString(resourceStore
					.retrieve(requestFile));
			if (request == null) {
				return null;
			}
			return getFile(request, login);
		} else if (requestFile == null) {
			Resource testResource = resourceStore
					.getResource(request + ".link");
			if (testResource != null) {
				return getFile(pageName, fileName + ".link", login);
			} else {
				return null;
			}
		}

		/*
		 * if( requestFile.isDirectory() ) { requestFile = new
		 * File(requestFile.getAbsolutePath()+"/page.html"); }
		 */

		return requestFile;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * org.onestonesoup.wiki.file.manager.FileManager#readFile(java.lang.String)
	 */
	private String readFile(Resource file) throws Exception {
		return FileHelper.loadFileAsString(resourceStore.retrieve(file));
	}

	public void saveFile(String pageName, String fileName, String data,
			Login login, boolean backup) throws Exception,
			AuthenticationException {
		if (controller.getAuthorizer().isAuthorized(login, pageName,
				Authorizer.ACTION_UPDATE) == true) {
			Resource file = resourceStore
					.getResource(pageName + "/" + fileName);
			if (file != null) {
				String oldData = readFile(file);
				if (oldData.equals(data)) {
					return;
				}
			}

			saveFile(pageName, fileName, data.getBytes(), login, backup);
		} else {
			throw new AuthenticationException("No save rights");
		}
	}

	private void saveFile(String pageName, String fileName, byte[] data,
			Login login, boolean backup) throws Exception,
			AuthenticationException {
		if (controller.getAuthorizer().isAuthorized(login, pageName,
				Authorizer.ACTION_UPDATE) == true) {
			ResourceFolder folder = resourceStore.getResourceFolder(pageName,
					true);

			resourceStore.buildResource(
					resourceStore.getResourceFolder(pageName + "/", true),
					fileName, data);
			if (backup == true) {
				backup(pageName, fileName, login);
			}
			markLastSaved();
			pageChangeTrigger.triggerListeners(pageName, "Saved Attachment "
					+ fileName);
		} else {
			throw new AuthenticationException("No save rights");
		}
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see org.onestonesoup.wiki.file.manager.FileManager#markLastSaved()
	 */
	public void markLastSaved() {
		lastFileSaved = System.currentTimeMillis();
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * org.onestonesoup.wiki.file.manager.FileManager#getLastSavedTimeStamp()
	 */
	public long getLastSavedTimeStamp() {
		return lastFileSaved;
	}

	public String getFileTemplate(String link, String displayName,
			String pageName, String fileName, String templateFileName)
			throws Exception, AuthenticationException {
		String extension = FileHelper.getExtension(fileName).toLowerCase();

		Map<String, String> parameters = new HashMap<String, String>();
		parameters.put("link", link);
		parameters.put("displayName", displayName);
		parameters.put("pageName", pageName);
		parameters.put("fileName", fileName);

		String template;
		if (pageAttachmentExists("/OpenForum/FileTemplates/" + extension,
				templateFileName, controller.getSystemLogin())) {
			template = TemplateHelper.generateStringWithTemplate(
					getPageAttachmentAsString("/OpenForum/FileTemplates/"
							+ extension, templateFileName, controller.getSystemLogin()),
					parameters);
		} else {
			template = TemplateHelper.generateStringWithTemplate(
					getPageAttachmentAsString(
							"/OpenForum/FileTemplates/default",
							templateFileName, controller.getSystemLogin()), parameters);
		}
		return template;
	}

	public void setVersionController(VersionController versionController) {
		this.versionController = versionController;
		controller.getLogger().info("Version Controller set as " + versionController);
	}

	public void setResourceStore(ResourceStore resourceStore) {
		this.resourceStore = resourceStore;

		root = resourceStore.getResourceFolder("/", true);

		if (root == null) {
			controller.getLogger().error("Root is not a valid target folder");
		} else {
			controller.getLogger().info("Resource Store set as " + resourceStore
					+ ". Root:" + root);
		}
	}

	public void revert(String pageName, String version, Login login)
			throws AuthenticationException {
		try {
			if (controller.getAuthorizer().isAuthorized(login, pageName,
					Authorizer.ACTION_UPDATE) == true) {
				throw new AuthenticationException("No update rights");
			}
		} catch (Throwable e) {
			throw new AuthenticationException("controller.getAuthenticator() failed. " + e);
		}

		PageVersion pageVersion = new PageVersion();
		pageVersion.reference = version;
		getVersionController().revertTo(pageName, pageVersion,
				login.getUser().getName());
	}
}
