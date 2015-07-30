package org.onestonesoup.openforum.versioncontrol;

import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;

import org.onestonesoup.openforum.filemanager.Resource;
import org.onestonesoup.openforum.filemanager.ResourceFolder;
import org.onestonesoup.openforum.filemanager.ResourceStore;

public class DefaultVersionController implements VersionController{

	private ResourceStore resourceStore;
	private SimpleDateFormat dateStamp = new SimpleDateFormat("yyyy-MM-dd-hh-mm-ss-SSSS");

	public DefaultVersionController(ResourceStore resourceStore) {
		this.resourceStore = resourceStore;
	}
	
	public boolean backup(String resourceName, String user, String message){
		Resource source = resourceStore.getResource(resourceName);
		String backupFolderName = source.getPath()+"/history";
		ResourceFolder backupFolder = resourceStore.getResourceFolder(backupFolderName, true);
		String backupFileName = source.getName()+"-"+dateStamp.format(new Date());
		String logFileName = source.getName()+".log";
		boolean success = resourceStore.copy(source, backupFolder, backupFileName);
		
		String logEntry = user + "\t" + message + "\t" + backupFileName + "\n";
		
		try {
			resourceStore.appendResource(new Resource(backupFolder, logFileName), logEntry.getBytes());
		} catch (IOException e) {
			return false;
		}
		
		return success;
	}

	public PageVersion[] getVersions(String pageFile) {
		// TODO Auto-generated method stub
		return null;
	}

	public String getDifferences(PageVersion version1, PageVersion version2) {
		// TODO Auto-generated method stub
		return null;
	}

	public void revertTo(String pageFile, PageVersion version, String user) {
		// TODO Auto-generated method stub
		
	}

}
