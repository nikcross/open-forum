package org.onestonesoup.openforum.javascript;

import static org.onestonesoup.openforum.controller.OpenForumConstants.*;

import java.io.InputStream;
import java.io.OutputStream;
import java.util.Map;

import org.onestonesoup.openforum.controller.OpenForumController;
import org.onestonesoup.openforum.filemanager.FileManager;
import org.onestonesoup.openforum.security.AuthenticationException;
import org.onestonesoup.openforum.security.Login;

public class JavascriptFileHelper  {

	private OpenForumController controller;
	private FileManager fileManager;
	private Login login;

	public JavascriptFileHelper(OpenForumController controller, Login login) {
		this.controller = controller;
		this.login = login;
		this.fileManager = controller.getFileManager();
	}

	public void appendToPageSource(String pageName, String data)
			throws Exception {
		fileManager.appendStringToPageSource(data, pageName, login);
	}

	public void appendStringToFile(String pageName, String fileName, String data)
			throws Exception {
		fileManager.appendStringToFile(data, pageName, fileName, true, true, login);
	}

	public boolean attachmentExists(String pageName, String fileName)
			throws Exception, AuthenticationException {
		return fileManager.pageAttachmentExists(pageName, fileName, login);
	}

	public boolean pageExists(String pageName) throws Exception,
			AuthenticationException {
		return fileManager.pageExists(pageName, login);
	}

	public String getAttachment(String pageName, String fileName)
			throws Exception, AuthenticationException {
		return fileManager.getPageAttachmentAsString(pageName, fileName, login);
	}

	public OutputStream getAttachmentOutputStream(String pageName,
			String fileName) throws Exception, AuthenticationException {
		return fileManager.getAttachmentOutputStream(pageName, fileName, login);
	}

	public InputStream getAttachmentInputStream(String pageName, String fileName)
			throws Exception, AuthenticationException {
		return fileManager.getAttachmentInputStream(pageName, fileName, login);
	}

	public boolean deleteAttachmentNoBackup(String pageName, String fileName)
			throws Exception {
		fileManager.deleteAttachment(pageName, fileName, false, login);
		return !fileManager.attachmentExists(pageName, fileName, login);
	}

	public long getAttachmentTimestamp(String pageName, String fileName)
			throws Exception, AuthenticationException {
		return fileManager.getAttachmentTimeStamp(pageName, fileName, login);
	}

	public long getAttachmentSize(String pageName, String fileName)
			throws Exception, AuthenticationException {
		return fileManager.getAttachmentSize(pageName, fileName, login);
	}

	public String getAttachment(String pageName, String fileName,
			boolean resolveLinks) throws Exception, AuthenticationException {
		return fileManager.getPageAttachmentAsString(pageName, fileName, login,
				resolveLinks);
	}

	public Map<String, String> getAttachmentsForPage(String pageName)
			throws Exception, AuthenticationException {
		return fileManager.getPageAttachments(pageName, login);
	}

	public String getPageInheritedFileAsString(String pageName, String fileName)
			throws Exception, AuthenticationException {
		return fileManager.getPageInheritedFileAsString(pageName, fileName,
				OPEN_FORUM_DEFAULT_PAGE_PATH, login);
	}

	public String getPageInheritedFilePath(String pageName, String fileName)
			throws Exception, AuthenticationException {
		return fileManager.getPageInheritedFilePath(pageName, fileName,
				OPEN_FORUM_DEFAULT_PAGE_PATH, login);
	}

	public void saveAttachment(String pageName, String fileName, String data)
			throws Exception, AuthenticationException {
		fileManager.saveStringAsAttachment(data, pageName, fileName, login,
				true);
		controller.markForRebuild();
	}

	public void saveAttachmentNoBackup(String pageName, String fileName,
			String data) throws Exception, AuthenticationException {
		fileManager.saveStringAsAttachment(data, pageName, fileName, login,
				false);
		controller.markForRebuild();
	}

	public void copyAttachment(String sourcePageName, String sourceFileName,
			String targetPageName, String targetFileName) throws Exception,
			AuthenticationException {
		fileManager.copyAttachment(sourceFileName, sourcePageName,
				targetFileName, targetPageName, login);
		controller.markForRebuild();
	}

	public void unZipAttachment(String pageName, String fileName)
			throws Exception, AuthenticationException {
		fileManager.unZipPageAttachment(pageName, fileName, login);
		controller.markForRebuild();
	}

	public void zipPage(String pageName) throws Exception,
			AuthenticationException {
		fileManager.zipPage(pageName, login);
		controller.markForRebuild();
	}

	public void appendStringToFileNoBackup(String pageName, String fileName, String data)
			throws Exception {
		fileManager.appendStringToFile(data, pageName, fileName, false, false, login);
	}
}
