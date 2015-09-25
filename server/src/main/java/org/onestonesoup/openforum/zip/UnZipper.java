package org.onestonesoup.openforum.zip;

import java.io.IOException;
import java.io.InputStream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

import org.onestonesoup.openforum.filemanager.ResourceFolder;
import org.onestonesoup.openforum.filemanager.ResourceStore;

public class UnZipper {

	private ZipInputStream zipInputStream;
	private String[] excludeList = null;

	public UnZipper(InputStream iStream) throws IOException {
		zipInputStream = new ZipInputStream(iStream);
	}

	public void unzipAll(ResourceStore resourceStore,
			ResourceFolder targetFolder) throws IOException {
		ZipEntry entry = zipInputStream.getNextEntry();

		while (entry != null) {
			if (isExcluded(entry.getName())) {
				entry = zipInputStream.getNextEntry();
				continue;
			}

			if (entry.isDirectory()) {
				resourceStore.getResourceFolder(
						targetFolder + "/" + entry.getName(), true);
			} else {
				resourceStore.buildResource(resourceStore.getResourceFolder(
						targetFolder.getPath(), true), entry.getName(),
						zipInputStream, entry.getSize(),
						false);
			}
			entry = zipInputStream.getNextEntry();
		}
	}

	public void setExcludeList(String[] excludeList) {
		this.excludeList = excludeList;
	}

	private boolean isExcluded(String entryName) {
		if (excludeList == null) {
			return false;
		}

		for (int loop = 0; loop < excludeList.length; loop++) {
			if (entryName.indexOf(excludeList[loop]) == 0) {
				return true;
			}
		}
		return false;
	}
}
