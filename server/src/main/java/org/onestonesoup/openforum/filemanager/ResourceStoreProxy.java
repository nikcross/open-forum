package org.onestonesoup.openforum.filemanager;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.MalformedURLException;
import java.net.URL;

import org.onestonesoup.openforum.controller.OpenForumController;

public class ResourceStoreProxy implements ResourceStore {

	private ResourceStore resourceStore;
	public ResourceStoreProxy(ResourceStore resourceStore)
	{
		this.resourceStore = resourceStore;
	}
	
	public void appendResource(Resource resource, byte[] data)
			throws IOException {
		resourceStore.appendResource(resource, data);
	}

	public Resource buildResource(ResourceFolder folder, String name,
			byte[] data) throws IOException {
		return resourceStore.buildResource(folder, name, data);
	}

	public Resource buildResource(ResourceFolder folder, String name,
			InputStream stream, long size) throws IOException {
		return resourceStore.buildResource(folder, name, stream, size);
	}

	public boolean copy(Resource sourceResource,
			ResourceFolder targetResourceFolder, String name) {
		return resourceStore.copy(sourceResource, targetResourceFolder, name);
	}

	public boolean copy(ResourceFolder sourceResourceFolder,
			ResourceFolder targetResourceFolder) {
		return resourceStore.copy(sourceResourceFolder, targetResourceFolder);
	}

	public boolean delete(Resource resource) {
		return resourceStore.delete(resource);
	}

	public boolean delete(ResourceFolder folder) {
		return resourceStore.delete(folder);
	}

	public InputStream getInputStream(Resource resource) throws IOException {
		return resourceStore.getInputStream(resource);
	}

	public int getLength(Resource resource) {
		return resourceStore.getLength(resource);
	}

	public OutputStream getOutputStream(Resource resource) throws IOException {
		return resourceStore.getOutputStream(resource);
	}

	public OutputStream getOutputStream(ResourceFolder resourceFolder,
			String name) throws IOException {
		return resourceStore.getOutputStream(resourceFolder,name);
	}

	public Resource getResource(String folderName) {
		return resourceStore.getResource(folderName);
	}

	public ResourceFolder getResourceFolder(String folderName, boolean mkdirs) {
		return resourceStore.getResourceFolder(folderName, mkdirs);
	}

	public boolean isResource(String name) {
		return resourceStore.isResource(name);
	}

	public boolean isResourceFolder(String name) {
		return resourceStore.isResourceFolder(name);
	}

	public long lastModified(Resource resource) {
		return resourceStore.lastModified(resource);
	}
	
	public long lastModified(ResourceFolder resource) {
		return resourceStore.lastModified(resource);
	}

	public ResourceFolder[] listResourceFolders(ResourceFolder folder) {
		return resourceStore.listResourceFolders(folder);
	}

	public Resource[] listResources(ResourceFolder folder) {
		return resourceStore.listResources(folder);
	}

	public boolean move(Resource sourceResource,
			ResourceFolder targetResourceFolder, String name) {
		return resourceStore.move(sourceResource, targetResourceFolder, name);
	}

	public boolean move(ResourceFolder sourceResourceFolder,
			ResourceFolder targetResourceFolder) {
		return resourceStore.move(sourceResourceFolder, targetResourceFolder);
	}

	public boolean rename(ResourceFolder resourceFolder, String newName) {
		return resourceStore.rename(resourceFolder, newName);
	}

	public InputStream retrieve(Resource resource) throws IOException {
		return resourceStore.retrieve(resource);
	}

	public InputStream store(Resource resource) throws IOException {
		return resourceStore.store(resource);
	}

	public String getMD5(Resource resource) throws IOException {
		return resourceStore.getMD5(resource);
	}
	
	public URL getResourceURL(Resource resource) throws MalformedURLException {
		return resourceStore.getResourceURL(resource);
	}
}
