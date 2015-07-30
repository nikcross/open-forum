package org.onestonesoup.openforum.filemanager;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.MalformedURLException;
import java.net.URL;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;

import org.onestonesoup.core.FileHelper;
import org.onestonesoup.core.StringHelper;

public class LocalDriveResourceStore implements ResourceStore {

	private File rootFile;
	private int pathOffset = 0;
	
	public LocalDriveResourceStore(String root)
	{
		this.rootFile = new File(root);
	}
	
	public void setPathOffset(String path)
	{
		while(path.length()>0 && path.charAt(0)=='/')
		{
			path = path.substring(1);
		}
		while(path.length()>0 && path.charAt(path.length()-1)=='/')
		{
			path = path.substring(0,path.length()-1);
		}		
		pathOffset = path.length();
	}
	
	public void appendResource(Resource resource, byte[] data) throws IOException {
		File folder = new File(rootFile.getAbsolutePath()+"/"+resource.getResourceFolder().getPath());
		if(folder.exists()==false)
		{
			folder.mkdirs();
		}
		
		File file = getResourceAsFile(resource);
		FileOutputStream oStream = new FileOutputStream(file,true);
		oStream.write(data);
		oStream.flush();
		oStream.close();
	}

	public Resource buildResource(ResourceFolder folder, String name, byte[] data) throws IOException {
		Resource resource = new Resource(folder,name);
		File file = getResourceAsFile(resource);
		//archive(resource);
		FileOutputStream oStream = new FileOutputStream(file,false);
		oStream.write(data);
		oStream.flush();
		oStream.close();
		
		return resource;
	}

	public Resource buildResource(ResourceFolder folder, String name,
			InputStream stream, long size) throws IOException
	{
		Resource resource = new Resource(folder,name);
		
		folder = new ResourceFolder(resource.toString().substring(0,resource.toString().lastIndexOf("/")),"");
		getResourceFolderAsFile( folder ).mkdirs();
		
		File file = getResourceAsFile(resource);
		FileOutputStream oStream = new FileOutputStream(file,false);
		
		FileHelper.copyInputStreamToOutputStream(stream, oStream);
		
		return resource;
	}

	public boolean copy(Resource sourceResource,
			ResourceFolder targetResourceFolder, String name) {
		
		File sourceFile = getResourceAsFile(sourceResource);
		Resource target = new Resource(targetResourceFolder,name);
		File targetFile = getResourceAsFile(target);
		try {
			FileHelper.copyFileToFile(sourceFile, targetFile);
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
		if(file.exists()==false) {
			return true;
		}
		if(file.isDirectory()) {
			for(File deleteFile: file.listFiles()) {
				if(delete(deleteFile)==false) {
					return false;
				}
				file.delete();
			}
		} else {
			if( file.delete()==false ) {
				return false;
			}
		}
		
		return true;
	}
	
	public InputStream getInputStream(Resource resource) throws IOException
	{
		return new FileInputStream( getResourceAsFile(resource) );
	}

	public int getLength(Resource resource) {
		return (int)getResourceAsFile(resource).length();
	}

	public OutputStream getOutputStream(Resource resource)  throws IOException
	{
		return new FileOutputStream( getResourceAsFile(resource) );
	}

	public OutputStream getOutputStream(ResourceFolder resourceFolder,
			String name)  throws IOException
	{
		Resource resource = new Resource(resourceFolder,name);
		return new FileOutputStream( getResourceAsFile(resource) );
	}

	public Resource getResource(String folderName) {
		if(folderName.startsWith("/")) {
			folderName = folderName.substring(1);
		}
		String[] parts = folderName.split("/");
		
		if(parts.length<2) {
			return null;
		}
		
		ResourceFolder folder = new ResourceFolder(StringHelper.arrayToString(parts,"/",0,parts.length-1),parts[parts.length-2]);
		Resource resource = new Resource(folder,parts[parts.length-1]);
		
		if( getResourceAsFile(resource).exists() && getResourceAsFile(resource).isDirectory()==false )
		{
			return resource;
		}
		else
		{
			return null;
		}
	}

	public ResourceFolder getResourceFolder(String folderName, boolean mkdirs) {
		String[] parts = folderName.split("/");
		if(parts.length==0)
		{
			parts = new String[]{""};
		}
		ResourceFolder folder = new ResourceFolder(folderName,parts[parts.length-1]);
		
		if(mkdirs==true)
		{
			File file = getResourceFolderAsFile(folder);
			if(file.exists()==false)
			{
				file.mkdirs();
			}
			if(file.isDirectory())
			{
				return folder;
			}
			else
			{
				return null;
			}
		}
		else if( getResourceFolderAsFile(folder).exists()==true && getResourceFolderAsFile(folder).isDirectory()==true )
		{
			return folder;
		}
		else
		{
			return null;
		}
	}

	public boolean isResource(String folderName) {
		if( getResource(folderName)!=null )
		{
			return true;
		}
		else
		{
			return false;
		}
	}

	public boolean isResourceFolder(String folderName) {
		if( getResourceFolder(folderName,false)!=null )
		{
			return true;
		}
		else
		{
			return false;
		}
	}

	public long lastModified(Resource resource) {
		return getResourceAsFile(resource).lastModified();
	}

	public ResourceFolder[] listResourceFolders(ResourceFolder folder) {
		String[] list = getResourceFolderAsFile(folder).list();
		ArrayList folders = new ArrayList();
		for(int loop=0;loop<list.length;loop++)
		{
			ResourceFolder listFolder = getResourceFolder(folder.getPath()+"/"+list[loop],false);
			if(listFolder!=null)
			{
				folders.add(listFolder);
			}
		}
		
		return (ResourceFolder[])folders.toArray(new ResourceFolder[]{});
	}

	public Resource[] listResources(ResourceFolder folder) {
		String[] list = getResourceFolderAsFile(folder).list();
		ArrayList resources = new ArrayList();
		for(int loop=0;loop<list.length;loop++)
		{
			Resource listFolder = getResource(folder.getPath()+"/"+list[loop]);
			if(listFolder!=null)
			{
				resources.add(listFolder);
			}
		}
		
		return (Resource[])resources.toArray(new Resource[]{});
	}

	public boolean move(Resource sourceResource,
			ResourceFolder targetResourceFolder, String name) {
		
		File file = getResourceAsFile(sourceResource);
		Resource resource = new Resource(targetResourceFolder,name);
		File newFile = getResourceAsFile(resource);
		file.renameTo(newFile);
		
		if( copy(sourceResource, targetResourceFolder,name)==false )
		{
			return false;
		}
		else
		{
			return delete(sourceResource);
		}
	}

	public boolean move(ResourceFolder sourceResourceFolder,
			ResourceFolder targetResourceFolder) {
		/*if( copy( sourceResourceFolder,targetResourceFolder )==false )
		{
			return false;
		}
		else
		{
			return delete(sourceResourceFolder);
		}*/
		
		File target = getResourceFolderAsFile(targetResourceFolder);
		File source = getResourceFolderAsFile(sourceResourceFolder);
		return source.renameTo(target);
	}

	public boolean rename(ResourceFolder resourceFolder, String newName) {
		ResourceFolder newFolder = new ResourceFolder( resourceFolder.getPath()+"/"+newName,newName );
		return getResourceFolderAsFile(resourceFolder).renameTo( getResourceFolderAsFile(newFolder) );
	}

	public InputStream retrieve(Resource resource) throws IOException {
		return new FileInputStream(getResourceAsFile(resource));
	}

	public InputStream store(Resource resource) throws IOException {
		return retrieve(resource);
	}

	public String getMD5(Resource resource) throws IOException
	{
		String path = getResourceAsFile(resource).getAbsolutePath();
		String md5Path = path+".md5";
		File md5File = new File(md5Path);
		
		if(md5File.exists())
		{
			return FileHelper.loadFileAsString( md5Path );
		}
		
			String md5 = FileHelper.generateMD5Checksum( getResourceAsFile(resource) );
			FileHelper.saveStringToFile(md5, md5Path);
		
			return md5;
	}
	
	private Resource createResource(String path,String name)
	{
		ResourceFolder folder = createResourceFolder(path);
		Resource resource = new Resource(folder,name);
		
		return resource;
	}
	
	private ResourceFolder createResourceFolder(String path)
	{
		String[] parts = path.split("/");
		ResourceFolder folder = new ResourceFolder(path,parts[parts.length-1]);
		
		return folder;
	}	
	
	public URL getResourceURL(Resource resource) throws MalformedURLException
	{
		return getResourceAsFile(resource).toURI().toURL();
	}
	
	private File getResourceAsFile( Resource resource )
	{
		String path = resource.getPath();
		while(path.length()>0 && path.charAt(0)=='/')
		{
			path = path.substring(1);
		}
		if(pathOffset==0)
		{
			return new File(rootFile.getAbsolutePath()+"/"+path+"/"+resource.getName() );
		}
		if(path.length()<pathOffset)
		{
			return new File(rootFile.getAbsolutePath());
		}
		else
		{
			path = path.substring(pathOffset);
		}
		while(path.length()>0 && path.charAt(0)=='/')
		{
			path = path.substring(1);
		}
		while(path.length()>0 && path.charAt(path.length()-1)=='/')
		{
			path = path.substring(0,path.length()-1);
		}			
		return new File(rootFile.getAbsolutePath()+"/"+path+"/"+resource.getName() );
	}
	
	private File getResourceFolderAsFile( ResourceFolder resourceFolder )
	{
		String path = resourceFolder.getPath();
		while(path.length()>0 && path.charAt(0)=='/')
		{
			path = path.substring(1);
		}
		if(pathOffset==0)
		{		
			return new File(rootFile.getAbsolutePath()+"/"+path );
		}
		path = path.substring(pathOffset);
		while(path.length()>0 && path.charAt(0)=='/')
		{
			path = path.substring(1);
		}
		while(path.length()>0 && path.charAt(path.length()-1)=='/')
		{
			path = path.substring(0,path.length()-1);
		}	
		return new File(rootFile.getAbsolutePath()+"/"+path );		
	}
	
	public String toString() {
		return "LocalDriveResourceStore with root "+rootFile;
	}
}
