package org.onestonesoup.openforum.zip;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.zip.Deflater;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import org.onestonesoup.openforum.filemanager.Resource;
import org.onestonesoup.openforum.filemanager.ResourceFolder;
import org.onestonesoup.openforum.filemanager.ResourceStore;

/*
 * Wet-Wired.com Library Version 2.1
 *
 * Copyright 2000-2001 by Wet-Wired.com Ltd.,
 * Portsmouth England
 * This software is OSI Certified Open Source Software
 * This software is covered by an OSI approved open source licence
 * which can be found at http://www.onestonesoup.org/OSSLicense.html
 */

/**
 * The Zipper class is a helper class that overlays an easy to use set of
 * methods on the java.util.zip classes. It allows for multiple entries to the
 * zip file, each specified as a local file name. A static method is also given
 * that will build a zip file of a single local file.
 *
 */

public class Zipper {

	private ZipOutputStream zOut;
	private OutputStream oStream;

	public Zipper(OutputStream oStream) throws IOException {

		this.oStream = oStream;
		zOut = new ZipOutputStream(oStream);

		zOut.setLevel(9);
		zOut.setMethod(Deflater.DEFLATED);
	}

	public void addEntry(String zipEntryName, InputStream iStream)
			throws IOException {
		this.addEntry(zipEntryName, iStream, true);
	}

	public void addEntry(String zipEntryName, InputStream iStream,
			boolean compress) throws IOException {

		zipEntryName = zipEntryName.replace('\\', '/');

		if (iStream == null) {
			if (zipEntryName.length() < 1
					|| zipEntryName.charAt(zipEntryName.length() - 2) != '/') {
				zipEntryName = zipEntryName + "/";
			}
			ZipEntry zEntry = new ZipEntry(zipEntryName);
			try {
				zOut.putNextEntry(zEntry);
			} catch (Exception e) {
			}
			return;
		}

		/*
		 * if(source.isDirectory()) { if(zipEntryName.length()<1 ||
		 * zipEntryName.charAt(zipEntryName.length()-2)!='/') { zipEntryName =
		 * zipEntryName+"/"; } ZipEntry zEntry = new ZipEntry(zipEntryName);
		 * try{ zOut.putNextEntry(zEntry); } catch(Exception e) { } return; }
		 */

		ZipEntry zEntry = new ZipEntry(zipEntryName);

		if (compress == true)
			zEntry.setMethod(ZipEntry.DEFLATED);
		else
			zEntry.setMethod(ZipEntry.STORED);

		zOut.putNextEntry(zEntry);

		byte[] data = new byte[10000];

		int inByte = iStream.read(data);

		while (inByte != -1) {
			zOut.write(data, 0, inByte);

			inByte = iStream.read(data);
		}

		zOut.closeEntry();

		iStream.close();
	}

	public void close() throws IOException {
		zOut.close();
		oStream.close();
	}

	public static void zip(InputStream in, OutputStream out, String zipEntryName)
			throws IOException {

		ZipOutputStream zOut = new ZipOutputStream(out);

		zOut.setLevel(9);
		zOut.setMethod(Deflater.DEFLATED);

		ZipEntry zEntry = new ZipEntry(zipEntryName);
		zOut.putNextEntry(zEntry);

		byte[] data = new byte[10000];

		int inByte = in.read(data);

		while (inByte != -1) {
			zOut.write(data, 0, inByte);

			inByte = in.read(data);
		}

		zOut.closeEntry();
		zOut.close();
		in.close();
	}

	public void zipAll(ResourceStore resourceStore, ResourceFolder folder)
			throws IOException {
		zipAll(resourceStore, folder, folder, true, false);
	}

	public void zipAllNoChildPages(ResourceStore resourceStore, ResourceFolder folder)
			throws IOException {
		zipAll(resourceStore, folder, folder, true, true);
	}

	public void zipAll(ResourceStore resourceStore, ResourceFolder root,
			ResourceFolder folder, boolean close, boolean excludeChildFolders) throws IOException {
		ResourceFolder[] folderList = resourceStore.listResourceFolders(folder);

		if(excludeChildFolders==false) {
			for (int loop = 0; loop < folderList.length; loop++) {
				if (folderList[loop].getName().endsWith("history"))
					continue;
				if (folderList[loop].getName().endsWith("private"))
					continue;
				zipAll(resourceStore, root, folderList[loop], false, false);
			}
		}

		Resource[] list = resourceStore.listResources(folder);
		for (int loop = 0; loop < list.length; loop++) {
			String entryName = list[loop].getPath() + "/"
					+ list[loop].getName();
			if (entryName.contains(".wiki.zip")) {
				continue;
			}
			if (entryName.charAt(0) == '/') {
				entryName = entryName.substring(1);
			}
			addEntry(entryName, resourceStore.getInputStream(list[loop]));
		}
		if (close) {
			close();
		}
	}

}
