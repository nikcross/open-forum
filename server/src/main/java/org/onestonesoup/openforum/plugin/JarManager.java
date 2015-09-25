package org.onestonesoup.openforum.plugin;

import static org.onestonesoup.openforum.controller.OpenForumConstants.DATA_FILE;

import java.io.File;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLClassLoader;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.onestonesoup.core.ExceptionHelper;
import org.onestonesoup.core.FileHelper;
import org.onestonesoup.core.StringHelper;
import org.onestonesoup.core.data.EntityTree;
import org.onestonesoup.javascript.engine.JavascriptEngine;
import org.onestonesoup.openforum.DataHelper;
import org.onestonesoup.openforum.controller.OpenForumController;
import org.onestonesoup.openforum.filemanager.FileManager;
import org.onestonesoup.openforum.filemanager.Resource;
import org.onestonesoup.openforum.javascript.JSONJavaAccess;
import org.onestonesoup.openforum.javascript.JSONJavaAccess.JSONWrapper;
import org.onestonesoup.openforum.security.AuthenticationException;


public class JarManager{

	private class ClassPath
	{
		public URL classPath;
		public long timeStamp;
		private ClassPath(URL classPath,long timeStamp)
		{
			this.classPath = classPath;
			this.timeStamp = timeStamp;
		}
	}
	
	private OpenForumController controller;
	private FileManager fileManager;
	private URLClassLoader urlClassLoader;
	private Map<String,ClassPath> classPath;
	private Map<String,Object> apis;
	
	public JarManager( OpenForumController controller,FileManager fileManager ) throws Throwable
	{		
		this.controller = controller;
		this.fileManager = fileManager;
		classPath = new HashMap<String,ClassPath>();
		apis = new HashMap<String,Object>();
	}
	
	public void updateClassPath(String path) throws Throwable
	{
		try{
			controller.getQueueManager().getQueue("/OpenForum/JarManager").postMessage( " Upadateing Class Path",controller.getSystemLogin().getUser().getName() );
			
			String[] list = path.split(";");
			boolean update = false;
			for(int loop=0;loop<list.length;loop++)
			{
				if(classPath.get(list[loop])!=null)
				{
					long oldTime = classPath.get(list[loop]).timeStamp;
					long newTime = new File(list[loop]).lastModified();
					if(oldTime<newTime)
					{
						controller.getQueueManager().getQueue("/OpenForum/JarManager").postMessage( new File(list[loop]).getName()+" CHANGED",controller.getSystemLogin().getUser().getName() );						
						update=true;
					}
					else
					{
						controller.getQueueManager().getQueue("/OpenForum/JarManager").postMessage( new File(list[loop]).getName()+" Unchanged",controller.getSystemLogin().getUser().getName() );						
					}
					continue;
				}
	
				try{
					controller.getQueueManager().getQueue("/OpenForum/JarManager").postMessage( list[loop]+" NEW",controller.getSystemLogin().getUser().getName() );
					controller.getLogger().info("Found Jar path to add "+list[loop]);
					Resource resource = fileManager.getResourceStore(controller.getSystemLogin()).getResource(list[loop]);
					if(resource==null) continue;
					classPath.put(
							list[loop],
							new ClassPath(
									fileManager.getResourceStore(controller.getSystemLogin()).getResourceURL(resource),
									fileManager.getResourceStore(controller.getSystemLogin()).lastModified(resource)
							)
						);
				}
				catch(MalformedURLException mue)
				{
					mue.printStackTrace();
				}
				update = true;
			}
			
			if( update==true )
			{
				updateClassLoader();
			}
			else
			{
				controller.getQueueManager().getQueue("/OpenForum/JarManager").postMessage( " No Class Paths to update",controller.getSystemLogin().getUser().getName() );
			}
			
			controller.getQueueManager().getQueue("/OpenForum/JarManager").postMessage( " Upadate Complete",controller.getSystemLogin().getUser().getName() );
		}
		catch(Throwable t)
		{
			StringBuffer result = new StringBuffer();
			result.append(StringHelper.arrayToString(ExceptionHelper.getTrace(t),"\n"));
			controller.getQueueManager().getQueue("/OpenForum/JarManager").postMessage( result.toString(),controller.getSystemLogin().getUser().getName() );			
			
			throw t;
		}
	}
	
	public void clearAPI(String pageName)
	{
		apis.remove(pageName);
	}
	
	public void clearAllAPIs()
	{
		apis = new HashMap<String,Object>();
	}
	
	public Object getApi(String pageName) throws Throwable
	{
		checkForChanges();
		
		Object api = apis.get(pageName);
		if(api==null )
		{	
			String className = getClassNameForApi(pageName);
			if(className==null) {
				return null;
			}
			
			api = getInstance(pageName,className);
			apis.put( pageName,api );
			initialiseAPI(pageName);
		}
		return api;
	}
	
	private void checkForChanges() throws Throwable
	{
		boolean update = false;
		
		for(String key: classPath.keySet())
		{
			long oldTime = classPath.get(key).timeStamp;
			long newTime = new File(key).lastModified();
			if(oldTime<newTime)
			{
				update=true;
			}
		}
		
		if( update==true )
		{
			updateClassLoader();
		}	
	}
	
	private Object getInstance(String pageName,String className) throws Throwable
	{
		Class clazz = urlClassLoader.loadClass(className);
		Object instance = clazz.newInstance();
		
		if( instance instanceof SystemAPI )
		{
			((SystemAPI)instance).setController(controller);
		}		
		return instance;
	}
	
	private void updateClassLoader() throws Throwable
	{
		URL[] urls = new URL[classPath.size()];
		
		int loop=0;
		for(String path: classPath.keySet())
		{
			urls[loop] = classPath.get( path ).classPath;
			controller.getLogger().info("Added JAR path "+classPath.get( path ));
			if(controller.getQueueManager()!=null)
			{
				controller.getQueueManager().getQueue("/OpenForum/JarManager").postMessage( "Added JAR path "+classPath.get( path ),controller.getSystemLogin().getUser().getName() );
			}
			
			classPath.get( path ).timeStamp = fileManager.getResourceStore(controller.getSystemLogin()).lastModified(
					fileManager.getResourceStore(controller.getSystemLogin()).getResource(path)
			);		
			loop++;
		}
		urlClassLoader = URLClassLoader.newInstance( urls,getClass().getClassLoader() );
		
		for(String pageName: apis.keySet())
		{
			String className = getClassNameForApi(pageName);
			
			try{
				apis.put( className,getInstance(pageName,className) );

				controller.getQueueManager().getQueue("/OpenForum/JarManager").postMessage( "Created instance of "+className,controller.getSystemLogin().getUser().getName() );
			}
			catch(Exception e)
			{
				apis.remove(className);
				e.printStackTrace();
				StringBuffer trace = new StringBuffer();
				trace.append(StringHelper.arrayToString(ExceptionHelper.getTrace(e),"\n"));
				controller.getQueueManager().getQueue("/OpenForum/JarManager").postMessage( "Failed to create instance of "+classPath+" "+trace.toString(),controller.getSystemLogin().getUser().getName() );
			}
		}
	}
	
	private void initialiseAPI(String pageName) throws Throwable
	{
		try{
			String script = controller.getFileManager().getPageAttachmentAsString( pageName,"initialise.sjs",controller.getSystemLogin() );
			if(script!=null)
			{
				JavascriptEngine js = controller.getJavascriptEngine(controller.getSystemLogin());
				
				script = "function initialiseSJS() {"+script+"} initialiseSJS();";
				
				js.runJavascript(pageName+"/initialise.sjs",script);
				
				controller.getQueueManager().getQueue("/OpenForum/JarManager").postMessage( "Ran initialise.js for API "+pageName,controller.getSystemLogin().getUser().getName() );
			}
		}
		catch(Throwable t)
		{
			StringBuffer trace = new StringBuffer();
			trace.append(StringHelper.arrayToString(ExceptionHelper.getTrace(t),"\n"));
			controller.getQueueManager().getQueue("/OpenForum/JarManager").postMessage( "Failed in initialise.js for API "+pageName+" "+trace.toString(),controller.getSystemLogin().getUser().getName() );
			
			throw t;
		}
	}
	
	public List<String> getJarsFor(FileManager fileManager,String pageName) throws AuthenticationException,Exception
	{
		List<String> jars = new ArrayList<String>();
		if( fileManager.getFolder(pageName,false,controller.getSystemLogin())==null )
		{
			jars.add( pageName );
			return jars;
		}
		
		jars.add(pageName);
		
		Map<String,String> attachments = fileManager.getPageAttachments(pageName,controller.getSystemLogin());
		
		for(String name: attachments.keySet())
		{
			String fullPath = (String)attachments.get(name);
			
			if( FileHelper.getExtension( name ).equals("jar") )
			{
				jars.add( fullPath );
			}
			else if( name.charAt(0)=='+' && name.equals("+history")==false )
			{
				jars.addAll( getJarsFor( fileManager,fullPath ) );
			}
		}
		
		return jars;
	}
	
	private String getClassNameForApi(String pageName) throws Throwable
	{
		if(controller.getFileManager().attachmentExists(pageName,DATA_FILE,controller.getSystemLogin())) {
			JSONWrapper data = new JSONJavaAccess(controller).getJSON(pageName,DATA_FILE);
			return data.get("apiClass");
		} else {
			return null;
		}
	}

	public void updateClassPath() throws Throwable {
		String[][] list = DataHelper.getPageAsList( fileManager.getPageAttachmentAsString("/OpenForum/JarManager","page.wiki",controller.getSystemLogin()));
		String path = "";
		for(int i=0;i<list.length;i++) {
			String resource = list[i][0];
			if(fileManager.getResourceStore(controller.getSystemLogin()).isResourceFolder(resource)) {
				Resource[] resources = fileManager.getResourceStore(controller.getSystemLogin()).listResources(fileManager.getResourceStore(controller.getSystemLogin()).getResourceFolder(resource,false));
				for(Resource r: resources) {
					if(r.getExtension().equals("jar")) {
						if(path.length()>0) {
							path+=";";
						}
						path+=r.getPath()+"/"+r.getName();
					}
				}
				continue;
			}
			
			if(path.length()>0) {
				path+=";";
			}
			path+=list[i][0];
		}
		updateClassPath( path );
	}
}
