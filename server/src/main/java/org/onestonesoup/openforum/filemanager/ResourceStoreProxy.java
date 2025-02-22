package org.onestonesoup.openforum.filemanager;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;
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

	private static final Resource CHANGE_LOG = new Resource( new ResourceFolder("/OpenForum","ChangeLog"), "change_log.txt" );

	private class NamedResourceStore {
		public NamedResourceStore(String name, ResourceStore store) {
			this.name = name;
			this.store = store;
		}
		public String name;
		public ResourceStore store;
	}

	private List<NamedResourceStore> resourceStores = new ArrayList<>();

	private ResourceStore changeLogeStore;

	public ResourceStoreProxy(){}

	public ResourceStoreProxy(ResourceStore resourceStore, String name) {
		resourceStores.add( new NamedResourceStore( name, resourceStore ) );
	}

	public ResourceStore getResourceStore(String name) {
		for(NamedResourceStore rs : resourceStores) {
			if(rs.name.equals(name)) {
				return rs.store;
			}
		}
		return null;
	}

	public List<String> getStoreNames() {
		List<String> storeNames = new ArrayList<>();
		for(NamedResourceStore rs : resourceStores) {
			storeNames.add(rs.name);
		}
		return storeNames;
	}

	public void addResourceStore(ResourceStore resourceStore, String name) {
		resourceStores.add( new NamedResourceStore( name, resourceStore ) );
		if( resourceStore.isReadOnly()==false && resourceStore.resourceExists( CHANGE_LOG ) ) {
			changeLogeStore = resourceStore;
		}
	}
	
	public void appendResource(Resource resource, byte[] data)
			throws IOException {
		getResourceStoreToWrite(resource).appendResource(resource, data);
	}

	public Resource buildResource(ResourceFolder folder, String name,
			byte[] data) throws IOException {
		Resource resource = getResourceStoreToWrite(folder).buildResource(folder, name, data);
		return resource;
	}

	public Resource buildResource(ResourceFolder folder, String name,
			InputStream stream, long size) throws IOException {
		return buildResource(folder, name, stream, size, true);
	}
	
	public Resource buildResource(ResourceFolder folder, String name,
			InputStream stream, long size, boolean closeStream) throws IOException {
		Resource resource = getResourceStoreToWrite(folder).buildResource(folder, name, stream, size, closeStream);
		return resource;
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
		Resource resource = null;//Todo
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

		Resource resource = null;//Todo

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
		Resource resource = null;//Todo
		return getResourceStoreToWrite(resourceFolder).getOutputStream(resourceFolder,name);
	}

	public Resource getResource(String folderName) {
		for(NamedResourceStore resourceStore: resourceStores) {
			Resource resource = resourceStore.store.getResource(folderName);
			if(resource!=null ){
				return resource;
			}
		}
		return null;
	}

	public ResourceFolder getResourceFolder(String folderName, boolean mkdirs) {
		for(NamedResourceStore resourceStore: resourceStores) {
			if(mkdirs==true && resourceStore.store.isReadOnly()) {
				continue;
			}
			ResourceFolder resourceFolder = resourceStore.store.getResourceFolder(folderName,mkdirs);
			if(resourceFolder!=null ){
				return resourceFolder;
			}
		}
		return null;
	}

	public boolean isResource(String name) {
		for(NamedResourceStore resourceStore: resourceStores) {
			if(resourceStore.store.isResource(name)) {
				return true;
			}
		}
		return false;
	}

	public boolean isResourceFolder(String name) {
		for(NamedResourceStore resourceStore: resourceStores) {
			if(resourceStore.store.isResourceFolder(name)) {
				return true;
			}
		}
		return false;
	}

	public long lastModified(Resource resource) {
		long lastModified = 0;
		for(NamedResourceStore resourceStore: resourceStores) {
			if(resourceStore.store.resourceExists(resource)) {
				if(lastModified==0 || resourceStore.store.lastModified(resource)>lastModified) {
					lastModified =  resourceStore.store.lastModified(resource);
				}
			}
		}
		return lastModified;
	}
	
	public long lastModified(ResourceFolder resource) {
		long lastModified = 0;
		for(NamedResourceStore resourceStore: resourceStores) {
			if(resourceStore.store.resourceFolderExists(resource)) {
				if(lastModified==0 || resourceStore.store.lastModified(resource)<lastModified) {
					lastModified =  resourceStore.store.lastModified(resource);
				}
			}
		}
		return lastModified;
	}

	public ResourceFolder[] listResourceFolders(ResourceFolder folder) {
		Map<String,ResourceFolder> folders = new HashMap<String,ResourceFolder>();
		
		for(NamedResourceStore resourceStore: resourceStores) {
			if(resourceStore.store.resourceFolderExists(folder)) {
				ResourceFolder[] resourceFolderList = resourceStore.store.listResourceFolders(folder);
				for(ResourceFolder resourceFolder: resourceFolderList) {
					folders.put(resourceFolder.toString(), resourceFolder);
				}
			}
		}
		
		return folders.values().toArray(new ResourceFolder[]{});
	}

	public Resource[] listResources(ResourceFolder folder) {
		Map<String,Resource> resources = new HashMap<String,Resource>();
		
		for(NamedResourceStore resourceStore: resourceStores) {
			if(resourceStore.store.resourceFolderExists(folder)) {
				Resource[] resourceList = resourceStore.store.listResources(folder);
				for(Resource resource: resourceList) {
					resources.put(resource.toString(), resource);
				}
			}
		}

		return resources.values().toArray(new Resource[]{});
	}

	public boolean move(Resource sourceResource,
			ResourceFolder targetResourceFolder, String name) {
		Resource resource  = null;//Todo
		return getResourceStoreToWrite(targetResourceFolder).move(sourceResource, targetResourceFolder, name);
	}

	public boolean move(ResourceFolder sourceResourceFolder,
			ResourceFolder targetResourceFolder) {
		Resource resource  = null;//Todo
		return getResourceStoreToWrite(targetResourceFolder).move(sourceResourceFolder, targetResourceFolder);
	}

	public boolean rename(ResourceFolder resourceFolder, String newName) {
		//Not possible if read-only
		Resource resource  = null;//Todo
		return getResourceStoreToWrite(resourceFolder).rename(resourceFolder, newName);
	}

	public String getMD5(Resource resource) throws IOException {
		return getResourceStoreToRead(resource).getMD5(resource);
	}
	
	public URL getResourceURL(Resource resource) throws MalformedURLException {
		return getResourceStoreToRead(resource).getResourceURL(resource);
	}

	@Override
	public boolean isReadOnly() {
		for(NamedResourceStore resourceStore: resourceStores) {
			if(resourceStore.store.isReadOnly()==false) {
				return false;
			}
		}
		return true;
	}
	
	private ResourceStore getResourceStoreToRead(Resource resource) {
		for(NamedResourceStore resourceStore: resourceStores) {
			if(resourceStore.store.resourceExists(resource) ){
				return resourceStore.store;
			}
		}
		return null;
	}
	
	private ResourceStore getResourceStoreToWrite(Resource resource) {
		for(NamedResourceStore resourceStore: resourceStores) {
			if(resourceStore.store.isReadOnly()==false ){
				return resourceStore.store;
			}
		}
		return null;
	}
	
	private ResourceStore getResourceStoreToRead(ResourceFolder folder) {
		for(NamedResourceStore resourceStore: resourceStores) {
			if(resourceStore.store.resourceFolderExists(folder) ){
				return resourceStore.store;
			}
		}
		return null;
	}
	
	private ResourceStore getResourceStoreToWrite(ResourceFolder folder) {
		for(NamedResourceStore resourceStore: resourceStores) {
			if(resourceStore.store.isReadOnly()==false ){
				return resourceStore.store;
			}
		}
		return null;
	}

	@Override
	public boolean resourceExists(Resource resource) {
		for(NamedResourceStore resourceStore: resourceStores) {
			if(resourceStore.store.resourceExists(resource)) {
				return true;
			}
		}
		return false;
	}

	@Override
	public boolean resourceFolderExists(ResourceFolder resourceFolder) {
		for(NamedResourceStore resourceStore: resourceStores) {
			if(resourceStore.store.resourceFolderExists(resourceFolder)) {
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

	private void logChange( Resource resource, String changeType ) {
		if( changeLogeStore != null ) {
			try {
				changeLogeStore.appendResource(CHANGE_LOG,(changeType + ":" + resource.toString()+"\n").getBytes());
			} catch (Throwable ignored) {

			}
		}
	}
}
