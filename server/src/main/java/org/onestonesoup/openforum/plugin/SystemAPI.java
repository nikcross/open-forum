package org.onestonesoup.openforum.plugin;

import org.onestonesoup.javascript.engine.JavascriptEngine;
import org.onestonesoup.openforum.controller.OpenForumController;

public abstract class SystemAPI {

	private OpenForumController controller;
	
	public void setController(OpenForumController controller)
	{
		this.controller = controller;
	}
	
	public JavascriptEngine getJavascriptEngine()
	{
		JavascriptEngine js = controller.getJavascriptEngine(controller.getSystemLogin());
		js.mount("systemApi",this);
		return js;
	}
	
	public String runJavascript(String pageName,String fileName,JavascriptEngine js) throws Throwable
	{
		String script = getController().getFileManager().getPageAttachmentAsString(pageName,fileName,getController().getSystemLogin());
		return js.runJavascript(pageName+"/"+fileName,script);
	}
	
	protected OpenForumController getController()
	{
		return controller;
	}
}
