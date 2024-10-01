package org.onestonesoup.openforum.filemanager;

import org.onestonesoup.core.FileHelper;

public class Resource {

	private ResourceFolder folder;
	private String name;
	private long size = -1;
	
	public Resource(ResourceFolder folder,String name, long size)
	{
		this.folder = folder;
		this.name = name;
		this.size = size;
	}

	public Resource(ResourceFolder folder,String name)
	{
		this.folder = folder;
		this.name = name;
	}

	public void setSize(long size) {
		this.size = size;
	}

	public long getSize() {
		return size;
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
