package org.onestonesoup.openforum.trigger;


import static org.onestonesoup.openforum.controller.OpenForumConstants.TRIGGER_SJS;

import org.onestonesoup.javascript.engine.JavascriptEngine;
import org.onestonesoup.openforum.DataHelper;
import org.onestonesoup.openforum.controller.OpenForumController;

public abstract class Trigger {

	private long timeStamp = -1;
	private String[][] listeners;
	
	private OpenForumController controller;
	
	public class TriggerProcessThread implements Runnable
	{
		private JavascriptEngine js;
		private String fileName;
		private String script;
		private TriggerProcessThread(JavascriptEngine js,String fileName,String script)
		{
			this.js = js;
			this.fileName = fileName;
			this.script = script;
			
			Thread thread = new Thread(this,fileName);
			thread.setPriority(Thread.MIN_PRIORITY);
			thread.start();
		}
		public void run()
		{
			try{
				js.runJavascript(fileName,script);
			}
			catch(Throwable th)
			{
				th.printStackTrace();
			}
		}
	}
	
	public Trigger(OpenForumController controller)
	{
		this.controller = controller;
		listeners = new String[][]{};
	}
	
	public void updateListeners() throws Exception
	{
		String pageData = controller.getFileManager().getPageSourceAsString( getPageName(),controller.getSystemLogin() );
		listeners = DataHelper.getPageAsList(pageData);
		timeStamp = controller.getFileManager().getPageTimeStamp( getPageName(),controller.getSystemLogin() );
	}
	
	public void triggerListeners(String value,String reason)
	{
		try{
			if( controller.getFileManager().getPageTimeStamp( getPageName(),controller.getSystemLogin() )!=timeStamp )
			{
				updateListeners();
			}
		}
		catch(Exception e)
		{
			e.printStackTrace();
			return;
		}
		
		for(int loop=0;loop<listeners.length;loop++ )
		{
			String pageName = listeners[loop][1];
			
			try{
				String script = controller.getFileManager().getPageAttachmentAsString(pageName,TRIGGER_SJS,controller.getSystemLogin());
				script = "function triggerSJS() {"+script+"} triggerSJS();";
				
				JavascriptEngine js = controller.getJavascriptEngine(controller.getSystemLogin());
				js.mount("pageName",pageName);
				js.mount("triggerPage",getPageName());
				
				js.mount("trigger",this);
				js.mount("triggerValue",value);
				js.mount("triggerReason",reason);
								
				new TriggerProcessThread( js,pageName+"/"+TRIGGER_SJS,script );
			}
			catch(Throwable th)
			{
				th.printStackTrace();
			}
		}
	}
	
	public abstract String getPageName();
}
