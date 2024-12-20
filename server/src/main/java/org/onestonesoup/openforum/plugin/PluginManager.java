package org.onestonesoup.openforum.plugin;

import static org.onestonesoup.openforum.controller.OpenForumConstants.DATA_FILE;
import static org.onestonesoup.openforum.controller.OpenForumConstants.CONTENT_FILE;

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
import org.onestonesoup.javascript.engine.JavascriptEngine;
import org.onestonesoup.openforum.DataHelper;
import org.onestonesoup.openforum.controller.OpenForumController;
import org.onestonesoup.openforum.filemanager.FileManager;
import org.onestonesoup.openforum.filemanager.Resource;
import org.onestonesoup.openforum.javascript.JSONJavaAccess;
import org.onestonesoup.openforum.javascript.JSONJavaAccess.JSONWrapper;
import org.onestonesoup.openforum.security.AuthenticationException;


public class PluginManager{

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
	
	public PluginManager( OpenForumController controller,FileManager fileManager ) throws Throwable
	{		
		this.controller = controller;
		this.fileManager = fileManager;
		classPath = new HashMap<String,ClassPath>();
		apis = new HashMap<String,Object>();
		updateClassLoader();
	}
	
	private void updateClassPath(String path) throws Throwable
	{
		try{
			controller.getLogger().info( " Upadateing Class Path" );
			
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
						controller.getLogger().info( new File(list[loop]).getName()+" CHANGED" );						
						update=true;
					}
					else
					{
						controller.getLogger().info( new File(list[loop]).getName()+" Unchanged" );						
					}
					continue;
				}
	
				try{
					controller.getLogger().info( list[loop]+" NEW" );
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
				controller.getLogger().info( " No Class Paths to update" );
			}
			
			controller.getLogger().info( " Upadate Complete" );
		}
		catch(Throwable t)
		{
			StringBuffer result = new StringBuffer();
			result.append(StringHelper.arrayToString(ExceptionHelper.getTrace(t),"\n"));
			controller.getLogger().info( result.toString() );			
			
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
			

			apis.put( pageName,null );
			updateClassPath();
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
		Class<?> clazz = urlClassLoader.loadClass(className);
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
			
			classPath.get( path ).timeStamp = fileManager.getResourceStore(controller.getSystemLogin()).lastModified(
					fileManager.getResourceStore(controller.getSystemLogin()).getResource(path)
			);		
			loop++;
		}
		urlClassLoader = URLClassLoader.newInstance( urls,getClass().getClassLoader() );

		Map newApis = new HashMap<String,Object>();
		for(String pageName: apis.keySet())
		{
			String className = getClassNameForApi(pageName);
			
			try{
				newApis.put( className,getInstance(pageName,className) );

				controller.getLogger().info( "Created instance of "+className );
			}
			catch(Exception e)
			{
				e.printStackTrace();
				StringBuffer trace = new StringBuffer();
				trace.append(StringHelper.arrayToString(ExceptionHelper.getTrace(e),"\n"));
				controller.getLogger().info( "Failed to create instance of "+classPath+" "+trace.toString() );
			}
		}
		apis = newApis;
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
				
				controller.getLogger().info( "Ran initialise.js for API "+pageName );
			}
		}
		catch(Throwable t)
		{
			StringBuffer trace = new StringBuffer();
			trace.append(StringHelper.arrayToString(ExceptionHelper.getTrace(t),"\n"));
			controller.getLogger().info( "Failed in initialise.js for API "+pageName+" "+trace.toString() );
			
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
		
		String path = "";
		for(String resource: apis.keySet()) {
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
			path+=resource;
		}
		updateClassPath( path );
	}
}
