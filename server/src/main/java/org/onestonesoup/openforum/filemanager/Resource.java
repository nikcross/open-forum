package org.onestonesoup.openforum.filemanager;

import org.onestonesoup.core.FileHelper;

public class Resource {

	private ResourceFolder folder;
	private String name;
	
	public Resource(ResourceFolder folder,String name)
	{
		this.folder = folder;
		this.name = name;
	}
	
	public String getName() {
		return name;
	}

	public String getExtension()
	{
		return FileHelper.getExtension(name);
	}
	
	public String getPath() {
		return folder.getPath();
	}

	public ResourceFolder getResourceFolder() {
		return folder;
	}

	public String toString()
	{
		return folder.getPath()+"/"+name;
	}
}
