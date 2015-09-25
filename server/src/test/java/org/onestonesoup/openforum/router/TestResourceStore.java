package org.onestonesoup.openforum.router;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.Map;

import org.onestonesoup.openforum.filemanager.Resource;
import org.onestonesoup.openforum.filemanager.ResourceFolder;
import org.onestonesoup.openforum.filemanager.ResourceStore;

public class TestResourceStore implements ResourceStore {

	private Map<String,String> folders;
	public TestResourceStore(Map<String,String> folders) {
		this.folders = folders;
	}
	
	public ResourceFolder getResourceFolder(String folderName, boolean mkdirs) {
		// TODO Auto-generated method stub
		return null;
	}

	public Resource getResource(String folderName) {
		if(folders.get(folderName)!=null) {
			return new Resource(new ResourceFolder(folderName,folderName),folderName);
		} else {
			return null;
		}
	}

	public boolean isResourceFolder(String name) {
		return true;
	}

	public boolean isResource(String name) {
		// TODO Auto-generated method stub
		return false;
	}

	public Resource buildResource(ResourceFolder folder, String name,
			byte[] data) throws IOException {
		// TODO Auto-generated method stub
		return null;
	}

	public Resource buildResource(ResourceFolder folder, String name,
			InputStream iStream, long size) throws IOException {
		// TODO Auto-generated method stub
		return null;
	}

	public void appendResource(Resource resource, byte[] data)
			throws IOException {
		// TODO Auto-generated method stub

	}

	public InputStream retrieve(Resource resource) throws IOException {
		// TODO Auto-generated method stub
		return null;
	}

	public InputStream store(Resource resource) throws IOException {
		// TODO Auto-generated method stub
		return null;
	}

	public boolean delete(Resource resource) {
		// TODO Auto-generated method stub
		return false;
	}

	public boolean move(Resource sourceResource,
			ResourceFolder targetResourceFolder, String name) {
		// TODO Auto-generated method stub
		return false;
	}

	public boolean copy(Resource sourceResource,
			ResourceFolder targetResourceFolder, String name) {
		// TODO Auto-generated method stub
		return false;
	}

	public long lastModified(Resource resource) {
		// TODO Auto-generated method stub
		return 0;
	}
	
	public long lastModified(ResourceFolder resource) {
		// TODO Auto-generated method stub
		return 0;
	}

	public int getLength(Resource resource) {
		// TODO Auto-generated method stub
		return 0;
	}

	public String getMD5(Resource resource) throws IOException {
		// TODO Auto-generated method stub
		return null;
	}

	public InputStream getInputStream(Resource resource) throws IOException {
		return new ByteArrayInputStream(resource.getPath().getBytes());
	}

	public OutputStream getOutputStream(Resource resource) throws IOException {
		// TODO Auto-generated method stub
		return null;
	}

	public OutputStream getOutputStream(ResourceFolder resourceFolder,
			String name) throws IOException {
		// TODO Auto-generated method stub
		return null;
	}

	public boolean delete(ResourceFolder folder) {
		// TODO Auto-generated method stub
		return false;
	}

	public boolean copy(ResourceFolder sourceResourceFolder,
			ResourceFolder targetResourceFolder) {
		// TODO Auto-generated method stub
		return false;
	}

	public boolean move(ResourceFolder sourceResourceFolder,
			ResourceFolder targetResourceFolder) {
		// TODO Auto-generated method stub
		return false;
	}

	public boolean rename(ResourceFolder resourceFolder, String newName) {
		// TODO Auto-generated method stub
		return false;
	}

	public ResourceFolder[] listResourceFolders(ResourceFolder folder) {
		// TODO Auto-generated method stub
		return null;
	}

	public Resource[] listResources(ResourceFolder folder) {
		// TODO Auto-generated method stub
		return null;
	}

	public URL getResourceURL(Resource resource) throws MalformedURLException {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public boolean isReadOnly() {
		// TODO Auto-generated method stub
		return false;
	}

	@Override
	public boolean resourceExists(Resource resource) {
		// TODO Auto-generated method stub
		return false;
	}

	@Override
	public boolean resourceFolderExists(ResourceFolder resourceFolder) {
		// TODO Auto-generated method stub
		return false;
	}

	@Override
	public Resource buildResource(ResourceFolder folder, String name,
			InputStream iStream, long size, boolean closeIStream)
			throws IOException {
		// TODO Auto-generated method stub
		return null;
	}

}
