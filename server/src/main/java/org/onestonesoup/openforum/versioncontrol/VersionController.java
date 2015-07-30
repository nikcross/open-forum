package org.onestonesoup.openforum.versioncontrol;


public interface VersionController {

	public boolean backup(String pageFile,String user,String message);
	public PageVersion[] getVersions(String pageFile);
	public String getDifferences(PageVersion version1,PageVersion version2);
	public void revertTo(String pageFile,PageVersion version,String user);
}
