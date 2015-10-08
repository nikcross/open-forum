package org.onestonesoup.openforum.filemanager;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.MalformedURLException;
import java.net.URL;

public interface ResourceStore {

	public abstract ResourceFolder getResourceFolder(String folderName,boolean mkdirs);
	public abstract Resource getResource(String folderName);
	
	public abstract boolean isResourceFolder(String name);
	public abstract boolean isResource(String name);
	public abstract boolean resourceExists(Resource resource);
	public abstract boolean resourceFolderExists(ResourceFolder resourceFolder);
	
	public abstract Resource buildResource(ResourceFolder folder,String name,byte[] data) throws IOException;
	public abstract Resource buildResource(ResourceFolder folder,String name,InputStream iStream,long size) throws IOException;
	public abstract Resource buildResource(ResourceFolder folder,String name,InputStream iStream,long size,boolean closeIStream) throws IOException;
	public abstract void appendResource(Resource resource,byte[] data) throws IOException;
	
	public abstract InputStream retrieve(Resource resource) throws IOException;
	public abstract InputStream store(Resource resource) throws IOException;
	public abstract boolean delete(Resource resource);
	public abstract boolean move(Resource sourceResource,ResourceFolder targetResourceFolder,String name);
	public abstract boolean copy(Resource sourceResource,ResourceFolder targetResourceFolder,String name);
	public abstract long lastModified(Resource resource);
	public abstract long lastModified(ResourceFolder resource);
	public abstract int getLength(Resource resource);
	public abstract String getMD5(Resource resource) throws IOException;
	public abstract InputStream getInputStream(Resource resource) throws IOException;
	public abstract OutputStream getOutputStream(Resource resource) throws IOException;
	public abstract OutputStream getOutputStream(ResourceFolder resourceFolder,String name) throws IOException;
	
	public abstract boolean delete(ResourceFolder folder);
	public abstract boolean copy(ResourceFolder sourceResourceFolder,ResourceFolder targetResourceFolder);
	public abstract boolean move(ResourceFolder sourceResourceFolder,ResourceFolder targetResourceFolder);
	public abstract boolean rename(ResourceFolder resourceFolder,String newName);
	
	public abstract ResourceFolder[] listResourceFolders(ResourceFolder folder);
	public abstract Resource[] listResources(ResourceFolder folder);
	
	public abstract URL getResourceURL(Resource resource) throws MalformedURLException;
	
	public abstract boolean isReadOnly();
	public abstract boolean contentMatches(Resource resource, byte[] data);
}