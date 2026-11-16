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
import org.onestonesoup.openforum.filemanager.ResourceStore;
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
			log( " Upadateing Class Path" );
			
			String[] list = path.split(";");
			boolean update = false;
			for(int loop=0;loop<list.length;loop++)
			{
				if(classPath.get(list[loop])!=null)
				{
					if(hasChanged(list[loop]))
					{
						log( new File(list[loop]).getName()+" CHANGED" );
						update=true;
					}
					else
					{
						log( new File(list[loop]).getName()+" Unchanged" );
					}
					continue;
				}
	
				try{
					log( list[loop]+" NEW" );
					log("Found Jar path to add "+list[loop]);
					Resource resource = resourceStore().getResource(list[loop]);
					if(resource==null) continue;
					classPath.put(
							list[loop],
							new ClassPath(
									resourceStore().getResourceURL(resource),
									resourceStore().lastModified(resource)
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
				log( " No Class Paths to update" );
			}
			
			log( " Upadate Complete" );
		}
		catch(Throwable t)
		{
			StringBuffer result = new StringBuffer();
			result.append(StringHelper.arrayToString(ExceptionHelper.getTrace(t),"\n"));
			log( result.toString() );			
			
			throw t;
		}
	}
	
	public synchronized void clearAPI(String pageName)
	{
		apis.remove(pageName);
	}
	
	public synchronized void clearAllAPIs()
	{
		apis = new HashMap<String,Object>();
	}
	
	public synchronized Object getApi(String pageName) throws Throwable
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
			if(hasChanged(key))
			{
				log( new File(key).getName()+" CHANGED" );
				update=true;
			}
		}
		
		if( update==true )
		{
			updateClassLoader();
		}	
	}
	
	/*
	 * Jars are keyed by their resource path (e.g. /Page/plugin.jar), so their
	 * timestamps must be read through the resource store. new File(key) would
	 * resolve against the file system root and always return 0 (OFS-B-002).
	 */
	private boolean hasChanged(String path)
	{
		ClassPath entry = classPath.get(path);
		if(entry==null)
		{
			return false;
		}
		long newTime = getTimeStamp(path);
		return newTime!=0 && newTime!=entry.timeStamp;
	}

	private long getTimeStamp(String path)
	{
		ResourceStore store = resourceStore();
		Resource resource = store.getResource(path);
		if(resource==null)
		{
			return 0;
		}
		return store.lastModified(resource);
	}

	protected ResourceStore resourceStore()
	{
		return fileManager.getResourceStore(controller.getSystemLogin());
	}

	protected void log(String message)
	{
		controller.getLogger().info( message );
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
			log("Added JAR path "+classPath.get( path ).classPath);
			
			classPath.get( path ).timeStamp = getTimeStamp(path);
			loop++;
		}
		urlClassLoader = URLClassLoader.newInstance( urls,getClass().getClassLoader() );

		// Rebuild the loaded APIs from the new class loader, still keyed by page name.
		// The old loader is not closed: objects already handed out (e.g. stored with
		// js.storeObject) may still need to load classes from it.
		Map<String,Object> newApis = new HashMap<String,Object>();
		for(String pageName: apis.keySet())
		{
			// A null entry is a page getApi() is loading right now; it builds and initialises it itself
			if(apis.get(pageName)==null)
			{
				continue;
			}
			String className = getClassNameForApi(pageName);
			if(className==null)
			{
				continue;
			}
			
			try{
				newApis.put( pageName,getInstance(pageName,className) );

				log( "Created instance of "+className );
			}
			catch(Exception e)
			{
				e.printStackTrace();
				StringBuffer trace = new StringBuffer();
				trace.append(StringHelper.arrayToString(ExceptionHelper.getTrace(e),"\n"));
				log( "Failed to create instance of "+className+" "+trace.toString() );
			}
		}
		apis = newApis;

		for(String pageName: newApis.keySet())
		{
			try{
				initialiseAPI(pageName);
			}
			catch(Throwable t)
			{
				// initialiseAPI has logged the failure; keep the other APIs available
			}
		}
	}
	
	protected void initialiseAPI(String pageName) throws Throwable
	{
		try{
			String script = controller.getFileManager().getPageAttachmentAsString( pageName,"initialise.sjs",controller.getSystemLogin() );
			if(script!=null)
			{
				JavascriptEngine js = controller.getJavascriptEngine(controller.getSystemLogin());
				
				script = "function initialiseSJS() {"+script+"} initialiseSJS();";
				
				js.runCachedJavascript(pageName+"/initialise.sjs",script);
				
				log( "Ran initialise.js for API "+pageName );
			}
		}
		catch(Throwable t)
		{
			StringBuffer trace = new StringBuffer();
			trace.append(StringHelper.arrayToString(ExceptionHelper.getTrace(t),"\n"));
			log( "Failed in initialise.js for API "+pageName+" "+trace.toString() );
			
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
	
	protected String getClassNameForApi(String pageName) throws Throwable
	{
		if(controller.getFileManager().attachmentExists(pageName,DATA_FILE,controller.getSystemLogin())) {
			JSONWrapper data = new JSONJavaAccess(controller).getJSON(pageName,DATA_FILE);
			return data.get("apiClass");
		} else {
			return null;
		}
	}

	public synchronized void updateClassPath() throws Throwable {
		
		String path = "";
		for(String resource: apis.keySet()) {
			if(resourceStore().isResourceFolder(resource)) {
				Resource[] resources = resourceStore().listResources(resourceStore().getResourceFolder(resource,false));
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
