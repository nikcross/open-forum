package org.onestonesoup.openforum.filemanager;

import java.io.*;
import java.net.MalformedURLException;
import java.net.URL;
import java.nio.ByteBuffer;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;

import com.sun.mail.iap.ByteArray;
import org.onestonesoup.core.FileHelper;
import org.onestonesoup.core.StringHelper;

public class LocalDriveResourceStore implements ResourceStore {

	private boolean readOnly = false;
	private File rootFile;
	private int pathOffset = 0;

	private FrequentFileCache frequentFileCache = new FrequentFileCache();

	public LocalDriveResourceStore(String root,boolean readOnly) {
		this.rootFile = new File(root).getAbsoluteFile();
		this.readOnly = readOnly;
		System.out.println("LocalDriveResourceStore root:"+rootFile+" readOnly:"+readOnly);
	}

	public long getTotalSpace() {
		return rootFile.getTotalSpace();
	}

	public long getFreeSpace() {
		return rootFile.getFreeSpace();
	}

	public void setPathOffset(String path) {
		while (path.length() > 0 && path.charAt(0) == '/') {
			path = path.substring(1);
		}
		while (path.length() > 0 && path.charAt(path.length() - 1) == '/') {
			path = path.substring(0, path.length() - 1);
		}
		pathOffset = path.length();
	}

	public void appendResource(Resource resource, byte[] data)
			throws IOException {
		File folder = new File(rootFile.getAbsolutePath() + "/"
				+ resource.getResourceFolder().getPath());
		if (folder.exists() == false) {
			folder.mkdirs();
		}

		File file = getResourceAsFile(resource);
		FileOutputStream oStream = new FileOutputStream(file, true);
		oStream.write(data);
		oStream.flush();
		oStream.close();
	}

	public Resource buildResource(ResourceFolder folder, String name,
			byte[] data) throws IOException {
		Resource resource = new Resource(folder, name);
		File file = getResourceAsFile(resource);
		
		if( contentMatches(resource, data)==false ) {
			FileOutputStream oStream = new FileOutputStream(file, false);
			oStream.write(data);
			oStream.flush();
			oStream.close();
			resource.setSize(data.length);
		}

		return resource;
	}
	
	public Resource buildResource(ResourceFolder folder, String name,
			InputStream stream, long size) throws IOException {
		return buildResource(folder, name, stream, size, true);
	}
	public Resource buildResource(ResourceFolder folder, String name,
			InputStream stream, long size, boolean closeStream) throws IOException {
		Resource resource = new Resource(folder, name);

		folder = new ResourceFolder(resource.toString().substring(0,
				resource.toString().lastIndexOf("/")), "");
		getResourceFolderAsFile(folder).mkdirs();

		File file = getResourceAsFile(resource);
		FileOutputStream oStream = new FileOutputStream(file, false);

		int fileSize = FileHelper.copyInputStreamToOutputStream(stream, oStream, closeStream);

		resource.setSize( (long)fileSize );

		return resource;
	}

	public boolean copy(Resource sourceResource,
			ResourceFolder targetResourceFolder, String name) {

		File sourceFile = getResourceAsFile(sourceResource);
		Resource target = new Resource(targetResourceFolder, name);
		File targetFile = getResourceAsFile(target);
		
		if(FileHelper.isSameFile(sourceFile, targetFile)) {
			return true;
		}
		
		try {
			FileHelper.copyFileToFile(sourceFile, targetFile);
			target.setSize( sourceResource.getSize() );
		} catch (IOException e) {
			e.printStackTrace();
			return false;
		}
		return true;
	}

	public boolean copy(ResourceFolder sourceResourceFolder,
			ResourceFolder targetResourceFolder) {
		// TODO Auto-generated method stub
		return false;
	}

	public boolean delete(Resource resource) {
		File file = getResourceAsFile(resource);
		return delete(file);
	}

	public boolean delete(ResourceFolder folder) {
		File file = getResourceFolderAsFile(folder);
		return delete(file);
	}

	private boolean delete(File file) {
		if (isReadOnly()) {
			return false;
		}

		if (file.exists() == false) {
			return true;
		}
		if (file.isDirectory()) {
			for (File deleteFile : file.listFiles()) {
				if (delete(deleteFile) == false) {
					return false;
				}
				file.delete();
			}
		} else {
			if (file.delete() == false) {
				return false;
			}
		}

		return true;
	}

	public FrequentFileCache getFrequentFileCache() {
		return frequentFileCache;
	}

	public InputStream getInputStream(Resource resource) throws IOException {
		File file = getResourceAsFile(resource);

		if(frequentFileCache!=null) {
			if (frequentFileCache.isCached(file)) {
				return frequentFileCache.getCachedInputStream(file);
			} else {
				frequentFileCache.checkToCache(file);
			}
		}

		return new FileInputStream( file );
	}

	public int getLength(Resource resource) {
		return (int) getResourceAsFile(resource).length();
	}

	public OutputStream getOutputStream(Resource resource) throws IOException {
		if (isReadOnly()) {
			return null;
		}

		return new FileOutputStream(getResourceAsFile(resource));
	}

	public OutputStream getOutputStream(ResourceFolder resourceFolder,
			String name) throws IOException {
		if (isReadOnly()) {
			return null;
		}

		Resource resource = new Resource(resourceFolder, name);
		return new FileOutputStream(getResourceAsFile(resource));
	}

	public Resource getResource(String folderName) {
		/*if (folderName.startsWith("/")) {
			folderName = folderName.substring(1);
		}*/
		String[] parts = folderName.split("/");

		if (parts.length < 2) {
			return null;
		}

		ResourceFolder folder = new ResourceFolder(StringHelper.arrayToString(
				parts, "/", 0, parts.length - 1), parts[parts.length - 2]);
		Resource resource = new Resource(folder, parts[parts.length - 1]);

		if (getResourceAsFile(resource).exists()
				&& getResourceAsFile(resource).isDirectory() == false) {
			resource.setSize( getResourceAsFile(resource).length() );
			return resource;
		} else {
			return null;
		}
	}

	public ResourceFolder getResourceFolder(String folderName, boolean mkdirs) {
		String[] parts = folderName.split("/");
		if (parts.length == 0) {
			parts = new String[] { "" };
		}
		ResourceFolder folder = new ResourceFolder(folderName,
				parts[parts.length - 1]);

		if (mkdirs == true) {
			File file = getResourceFolderAsFile(folder);
			if (file.exists() == false) {
				file.mkdirs();
			}
			if (file.isDirectory()) {
				return folder;
			} else {
				return null;
			}
		} else if (getResourceFolderAsFile(folder).exists() == true
				&& getResourceFolderAsFile(folder).isDirectory() == true) {
			return folder;
		} else {
			return null;
		}
	}

	public boolean isResource(String folderName) {
		if (getResource(folderName) != null) {
			return true;
		} else {
			return false;
		}
	}

	public boolean isResourceFolder(String folderName) {
		if (getResourceFolder(folderName, false) != null) {
			return true;
		} else {
			return false;
		}
	}

	public long lastModified(Resource resource) {
		return getResourceAsFile(resource).lastModified();
	}

	public long lastModified(ResourceFolder resource) {
		long lastModified = 0;
		File folder = getResourceFolderAsFile(resource);
		for (File file : folder.listFiles()) {
			if (file.lastModified() > lastModified) {
				lastModified = file.lastModified();
			}
		}
		return lastModified;
	}

	public ResourceFolder[] listResourceFolders(ResourceFolder folder) {
		String[] list = getResourceFolderAsFile(folder).list();
		ArrayList<ResourceFolder> folders = new ArrayList<ResourceFolder>();
		for (int loop = 0; loop < list.length; loop++) {
			ResourceFolder listFolder = getResourceFolder(folder.getPath()
					+ "/" + list[loop], false);
			if (listFolder != null) {
				folders.add(listFolder);
			}
		}

		return (ResourceFolder[]) folders.toArray(new ResourceFolder[] {});
	}

	public Resource[] listResources(ResourceFolder folder) {
		String[] list = getResourceFolderAsFile(folder).list();
		ArrayList<Resource> resources = new ArrayList<Resource>();
		for (int loop = 0; loop < list.length; loop++) {
			Resource listFolder = getResource(folder.getPath() + "/"
					+ list[loop]);
			if (listFolder != null) {
				resources.add(listFolder);
			}
		}

		return (Resource[]) resources.toArray(new Resource[] {});
	}

	public boolean move(Resource sourceResource,
			ResourceFolder targetResourceFolder, String name) {
		if(isReadOnly()) {
			return false;
		}
		
		File file = getResourceAsFile(sourceResource);
		Resource resource = new Resource(targetResourceFolder, name);
		File newFile = getResourceAsFile(resource);
		file.renameTo(newFile);

		if (copy(sourceResource, targetResourceFolder, name) == false) {
			return false;
		} else {
			resource.setSize( sourceResource.getSize() );
			return delete(sourceResource);
		}
	}

	public boolean move(ResourceFolder sourceResourceFolder,
			ResourceFolder targetResourceFolder) {
		if(isReadOnly()) {
			return false;
		}
		
		/*
		 * if( copy( sourceResourceFolder,targetResourceFolder )==false ) {
		 * return false; } else { return delete(sourceResourceFolder); }
		 */

		File target = getResourceFolderAsFile(targetResourceFolder);
		File source = getResourceFolderAsFile(sourceResourceFolder);
		return source.renameTo(target);
	}

	public boolean rename(ResourceFolder resourceFolder, String newName) {
		if(isReadOnly()) {
			return false;
		}
		
		ResourceFolder newFolder = new ResourceFolder(resourceFolder.getPath()
				+ "/" + newName, newName);
		return getResourceFolderAsFile(resourceFolder).renameTo(
				getResourceFolderAsFile(newFolder));
	}

	public String getMD5(Resource resource) throws IOException {
		String path = getResourceAsFile(resource).getAbsolutePath();
		String md5Path = path + ".md5";
		File md5File = new File(md5Path);

		if (md5File.exists()) {
			return FileHelper.loadFileAsString(md5Path);
		}

		String md5 = FileHelper
				.generateMD5Checksum(getResourceAsFile(resource));
		FileHelper.saveStringToFile(md5, md5Path);

		return md5;
	}

	public URL getResourceURL(Resource resource) throws MalformedURLException {
		return getResourceAsFile(resource).toURI().toURL();
	}

	private File getResourceAsFile(Resource resource) {
		String path = resource.getPath();
		while (path.length() > 0 && path.charAt(0) == '/') {
			path = path.substring(1);
		}
		if (pathOffset == 0) {
			return new File(rootFile.getAbsolutePath() + "/" + path + "/"
					+ resource.getName());
		}
		if (path.length() < pathOffset) {
			return new File(rootFile.getAbsolutePath());
		} else {
			path = path.substring(pathOffset);
		}
		while (path.length() > 0 && path.charAt(0) == '/') {
			path = path.substring(1);
		}
		while (path.length() > 0 && path.charAt(path.length() - 1) == '/') {
			path = path.substring(0, path.length() - 1);
		}
		String pathName = rootFile.getAbsolutePath() + "/" + path + "/"
				+ resource.getName();
		return new File( pathName);
	}

	private File getResourceFolderAsFile(ResourceFolder resourceFolder) {
		String path = resourceFolder.getPath();
		while (path.length() > 0 && path.charAt(0) == '/') {
			path = path.substring(1);
		}
		if (pathOffset == 0) {
			return new File(rootFile.getAbsolutePath() + "/" + path);
		}
		path = path.substring(pathOffset);
		while (path.length() > 0 && path.charAt(0) == '/') {
			path = path.substring(1);
		}
		while (path.length() > 0 && path.charAt(path.length() - 1) == '/') {
			path = path.substring(0, path.length() - 1);
		}
		return new File(rootFile.getAbsolutePath() + "/" + path);
	}

	public String toString() {
		return "LocalDriveResourceStore with root " + rootFile + ". Read Only:"
				+ readOnly;
	}

	public boolean isReadOnly() {
		return readOnly;
	}

	public boolean resourceExists(Resource resource) {
		return getResourceAsFile(resource).exists();
	}

	public boolean resourceFolderExists(ResourceFolder resourceFolder) {
		return getResourceFolderAsFile(resourceFolder).exists();
	}

	public boolean contentMatches(Resource resource, byte[] data) {
		File file = getResourceAsFile(resource);
		try {
			return (file.exists() && file.length()==data.length && FileHelper.loadFileAsString(file).equals(new String(data)));
		} catch (IOException e) {
			return false;
		}
	}
}
