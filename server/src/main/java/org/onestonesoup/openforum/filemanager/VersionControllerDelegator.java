package org.onestonesoup.openforum.filemanager;

import org.onestonesoup.openforum.controller.OpenForumController;
import org.onestonesoup.openforum.versioncontrol.PageVersion;
import org.onestonesoup.openforum.versioncontrol.VersionController;

public class VersionControllerDelegator implements VersionController{
	
	private OpenForumController controller;
	public VersionControllerDelegator(OpenForumController fileManager)
	{
		this.controller = fileManager;
	}
	
	private VersionController getVersionController()
	{
		try{
			return (VersionController)controller.getApi("/OpenForum/VersionController");
		}
		catch(Throwable e)
		{
			return null;
		}
	}

	public boolean backup(String pageFile, String user, String message) {
		return getVersionController().backup(pageFile, user, message);
	}

	public String getDifferences(PageVersion version1, PageVersion version2) {
		return getVersionController().getDifferences(version1, version2);
	}

	public PageVersion[] getVersions(String pageFile) {
		return getVersionController().getVersions(pageFile);
	}

	public void revertTo(String pageFile, PageVersion version, String user) {
		getVersionController().revertTo(pageFile, version, user);
	}
	
}
