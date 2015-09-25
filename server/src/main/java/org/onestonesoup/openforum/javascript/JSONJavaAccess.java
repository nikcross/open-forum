package org.onestonesoup.openforum.javascript;

import org.onestonesoup.javascript.engine.JSON;
import org.onestonesoup.javascript.engine.JavascriptEngine;
import org.onestonesoup.openforum.controller.OpenForumController;
import org.onestonesoup.openforum.security.AuthenticationException;

public class JSONJavaAccess {

	public class JSONWrapper {
		
		private String pageName;
		private String fileName;
		private Object object;
		private String id;

		public JSONWrapper(String pageName, String fileName,Object object,String id) {
			this.pageName = pageName;
			this.fileName = fileName;
			this.object = object;
			this.id = id;
		}
		
		public String get(String path) throws Throwable {
			return engine.runJavascript("JSONWrapper", id+"."+path);
		}
		
		public String set(String path,String value) throws Throwable {
			engine.runJavascript("JSONWrapper", id + "." + path + "=" + json.stringify(value).toString());
			return get(path);
		}
		
		public String set(String path,Number value) throws Throwable {
			engine.runJavascript("JSONWrapper", id + "." + path + "=" + json.stringify(value).toString());
			return get(path);
		}
		
		public boolean save() throws AuthenticationException, Exception {
			byte[] data = json.stringify(object).toString().getBytes();
			long length = controller.saveAsAttachment(pageName, fileName, data, controller.getSystemLogin());
			return (length==data.length);
		}
	}
	
	private  OpenForumController controller;
	private JavascriptEngine engine;
	private JSON json;
	
	public JSONJavaAccess(OpenForumController controller) {
		this.controller = controller;
		this.engine = controller.getJavascriptEngine(controller.getSystemLogin());
		this.json = new JSON(engine);
	}
	
	public JSONWrapper getJSON(String pageName, String fileName) throws Throwable {

		String rawJSON = controller.getFileManager().getPageAttachmentAsString(pageName, fileName, controller.getSystemLogin());
		String id = controller.generateUniqueId().replace("UID:","JSON").replace(".", "");
		engine.runJavascript("JSONJavaWrapper", id + "= " + rawJSON.trim() + ";");
		Object object = engine.getObject(id);
		
		return new JSONWrapper(pageName,fileName,object,id);
	}
}
