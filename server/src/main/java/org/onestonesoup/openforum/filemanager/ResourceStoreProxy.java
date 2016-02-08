package org.onestonesoup.openforum.filemanager;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.onestonesoup.core.FileHelper;

/**
 * Enables the use of multiple resource stores that can either be read/write or read only
 * 
 * Reads are served from the first store in the list that contains the resource.
 * Writes are written to the first non read only store in the list.
 * This allows for a reference set of files to be used with all updates written to a separate store.
 * 
 * @author nik
 *
 */

public class ResourceStoreProxy implements ResourceStore {
	
	private List<ResourceStore> resourceStores = new ArrayList<ResourceStore>();
	
	public ResourceStoreProxy(ResourceStore resourceStore)
	{
		resourceStores.add(resourceStore);
	}
	
	public void addResourceStore(ResourceStore resourceStore) {
		resourceStores.add(resourceStore);
	}
	
	public void appendResource(Resource resource, byte[] data)
			throws IOException {
		getResourceStoreToWrite(resource).appendResource(resource, data);
	}

	public Resource buildResource(ResourceFolder folder, String name,
			byte[] data) throws IOException {
		return getResourceStoreToWrite(folder).buildResource(folder, name, data);
	}

	public Resource buildResource(ResourceFolder folder, String name,
			InputStream stream, long size) throws IOException {
		return buildResource(folder, name, stream, size, true);
	}
	
	public Resource buildResource(ResourceFolder folder, String name,
			InputStream stream, long size, boolean closeStream) throws IOException {
		return getResourceStoreToWrite(folder).buildResource(folder, name, stream, size, closeStream);
	}

	public boolean copy(Resource sourceResource,
			ResourceFolder targetResourceFolder, String name) {
		
		
		try {
			InputStream iStream = getResourceStoreToRead(sourceResource).getInputStream(sourceResource);
			OutputStream oStream = getResourceStoreToWrite(targetResourceFolder).getOutputStream(targetResourceFolder, name);
			
			FileHelper.copyInputStreamToOutputStream(iStream, oStream);
		} catch (IOException e) {
			e.printStackTrace();
			return false;
		}
		
		return true;
	}

	public boolean copy(ResourceFolder sourceResourceFolder,
			ResourceFolder targetResourceFolder) {
		Resource[] resources = listResources(sourceResourceFolder);
		boolean done = true;
		for(Resource resource: resources) {
			if(copy(resource, targetResourceFolder, resource.getName())==false) {
				done = false;
			}
		}
		return done;
	}

	public boolean delete(Resource resource) {
		getResourceStoreToRead(resource).delete(resource);
		return !resourceExists(resource);
	}

	public boolean delete(ResourceFolder folder) {
		getResourceStoreToWrite(folder).delete(folder);
		return !resourceFolderExists(folder);
	}

	public InputStream getInputStream(Resource resource) throws IOException {
		return getResourceStoreToRead(resource).getInputStream(resource);
	}

	public int getLength(Resource resource) {
		return getResourceStoreToRead(resource).getLength(resource);
	}

	public OutputStream getOutputStream(Resource resource) throws IOException {
		return getResourceStoreToWrite(resource).getOutputStream(resource);
	}

	public OutputStream getOutputStream(ResourceFolder resourceFolder,
			String name) throws IOException {
		return getResourceStoreToWrite(resourceFolder).getOutputStream(resourceFolder,name);
	}

	public Resource getResource(String folderName) {
		for(ResourceStore resourceStore: resourceStores) {
			Resource resource = resourceStore.getResource(folderName);
			if(resource!=null ){
				return resource;
			}
		}
		return null;
	}

	public ResourceFolder getResourceFolder(String folderName, boolean mkdirs) {
		for(ResourceStore resourceStore: resourceStores) {
			if(mkdirs==true && resourceStore.isReadOnly()) {
				continue;
			}
			ResourceFolder resourceFolder = resourceStore.getResourceFolder(folderName,mkdirs);
			if(resourceFolder!=null ){
				return resourceFolder;
			}
		}
		return null;
	}

	public boolean isResource(String name) {
		for(ResourceStore resourceStore: resourceStores) {
			if(resourceStore.isResource(name)) {
				return true;
			}
		}
		return false;
	}

	public boolean isResourceFolder(String name) {
		for(ResourceStore resourceStore: resourceStores) {
			if(resourceStore.isResourceFolder(name)) {
				return true;
			}
		}
		return false;
	}

	public long lastModified(Resource resource) {
		long lastModified = 0;
		for(ResourceStore resourceStore: resourceStores) {
			if(resourceStore.resourceExists(resource)) {
				if(lastModified==0 || resourceStore.lastModified(resource)>lastModified) {
					lastModified =  resourceStore.lastModified(resource);
				}
			}
		}
		return lastModified;
	}
	
	public long lastModified(ResourceFolder resource) {
		long lastModified = 0;
		for(ResourceStore resourceStore: resourceStores) {
			if(resourceStore.resourceFolderExists(resource)) {
				if(lastModified==0 || resourceStore.lastModified(resource)<lastModified) {
					lastModified =  resourceStore.lastModified(resource);
				}
			}
		}
		return lastModified;
	}

	public ResourceFolder[] listResourceFolders(ResourceFolder folder) {
		Map<String,ResourceFolder> folders = new HashMap<String,ResourceFolder>();
		
		for(ResourceStore resourceStore: resourceStores) {
			if(resourceStore.resourceFolderExists(folder)) {
				ResourceFolder[] resourceFolderList = resourceStore.listResourceFolders(folder);
				for(ResourceFolder resourceFolder: resourceFolderList) {
					folders.put(resourceFolder.toString(), resourceFolder);
				}
			}
		}
		
		return folders.values().toArray(new ResourceFolder[]{});
	}

	public Resource[] listResources(ResourceFolder folder) {
		Map<String,Resource> resources = new HashMap<String,Resource>();
		
		for(ResourceStore resourceStore: resourceStores) {
			if(resourceStore.resourceFolderExists(folder)) {
				Resource[] resourceList = resourceStore.listResources(folder);
				for(Resource resource: resourceList) {
					resources.put(resource.toString(), resource);
				}
			}
		}

		return resources.values().toArray(new Resource[]{});
	}

	public boolean move(Resource sourceResource,
			ResourceFolder targetResourceFolder, String name) {
		return getResourceStoreToWrite(targetResourceFolder).move(sourceResource, targetResourceFolder, name);
	}

	public boolean move(ResourceFolder sourceResourceFolder,
			ResourceFolder targetResourceFolder) {
		return getResourceStoreToWrite(targetResourceFolder).move(sourceResourceFolder, targetResourceFolder);
	}

	public boolean rename(ResourceFolder resourceFolder, String newName) {
		//Not possible if read-only
		return getResourceStoreToWrite(resourceFolder).rename(resourceFolder, newName);
	}

	public InputStream retrieve(Resource resource) throws IOException {
		return getResourceStoreToRead(resource).retrieve(resource);
	}

	public InputStream store(Resource resource) throws IOException {
		return getResourceStoreToRead(resource).store(resource);
	}

	public String getMD5(Resource resource) throws IOException {
		return getResourceStoreToRead(resource).getMD5(resource);
	}
	
	public URL getResourceURL(Resource resource) throws MalformedURLException {
		return getResourceStoreToRead(resource).getResourceURL(resource);
	}

	@Override
	public boolean isReadOnly() {
		for(ResourceStore resourceStore: resourceStores) {
			if(resourceStore.isReadOnly()==false) {
				return false;
			}
		}
		return true;
	}
	
	private ResourceStore getResourceStoreToRead(Resource resource) {
		for(ResourceStore resourceStore: resourceStores) {
			if(resourceStore.resourceExists(resource) ){
				return resourceStore;
			}
		}
		return null;
	}
	
	private ResourceStore getResourceStoreToWrite(Resource resource) {
		for(ResourceStore resourceStore: resourceStores) {
			if(resourceStore.isReadOnly()==false ){
				return resourceStore;
			}
		}
		return null;
	}
	
	private ResourceStore getResourceStoreToRead(ResourceFolder folder) {
		for(ResourceStore resourceStore: resourceStores) {
			if(resourceStore.resourceFolderExists(folder) ){
				return resourceStore;
			}
		}
		return null;
	}
	
	private ResourceStore getResourceStoreToWrite(ResourceFolder folder) {
		for(ResourceStore resourceStore: resourceStores) {
			if(resourceStore.isReadOnly()==false ){
				return resourceStore;
			}
		}
		return null;
	}

	@Override
	public boolean resourceExists(Resource resource) {
		for(ResourceStore resourceStore: resourceStores) {
			if(resourceStore.resourceExists(resource)) {
				return true;
			}
		}
		return false;
	}

	@Override
	public boolean resourceFolderExists(ResourceFolder resourceFolder) {
		for(ResourceStore resourceStore: resourceStores) {
			if(resourceStore.resourceFolderExists(resourceFolder)) {
				return true;
			}
		}
		return false;
	}

	@Override
	public boolean contentMatches(Resource resource, byte[] data) {
		if(resource==null || data==null) {
			return false;
		}
		if(getResourceStoreToWrite(resource).resourceExists(resource)==true) {
			return getResourceStoreToWrite(resource).contentMatches(resource, data);
		} else if(getResourceStoreToRead(resource).resourceExists(resource)) {
			return getResourceStoreToRead(resource).contentMatches(resource, data);
		}
		return false;
	}
}
