package org.onestonesoup.openforum.filemanager;

import org.onestonesoup.core.StringHelper;

public class ResourceFolder {

	private String path;
	private String name;

	public ResourceFolder(String path, String name) {
		this.path = path;
		this.name = name;
	}

	public String getName() {
		return name;
	}

	public String getPath() {
		return path;
	}

	public ResourceFolder getResourceFolder() {
		String[] parts = path.split("/");
		String parentPath = StringHelper.arrayToString(parts, "/", 0,
				parts.length - 2);

		return new ResourceFolder(parentPath, parts[parts.length - 2]);
	}

	public String toString() {
		return path;
	}
}
