package org.onestonesoup.openforum.javascript;

import java.io.IOException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.xml.bind.DatatypeConverter;

import org.mozilla.javascript.NativeObject;
import org.mozilla.javascript.ScriptableObject;
import org.onestonesoup.javascript.engine.JavascriptEngine;
import org.onestonesoup.openforum.controller.OpenForumController;
import org.onestonesoup.openforum.filemanager.FileManager;
import org.onestonesoup.openforum.security.AuthenticationException;
import org.onestonesoup.openforum.security.Authorizer;
import org.onestonesoup.openforum.security.Login;

public class JavascriptHelper {

	private OpenForumController controller;
	private FileManager fileManager;
	private Login login;
	private Map<String, NativeObject> functions = new HashMap<String, NativeObject>();
	private JavascriptEngine engine;

	public JavascriptHelper(JavascriptEngine engine,
			OpenForumController controller, FileManager fileManager, Login login) {
		this.engine = engine;
		this.controller = controller;
		this.fileManager = fileManager;
		this.login = login;
	}

	public Object getObject(String pageName, String fileName) throws Throwable {		
		String name = pageName + "/" + fileName;
		
		if(!controller.getAuthorizer().isAuthorized(login, name, Authorizer.ACTION_READ)) {
			throw new AuthenticationException("No read rights for object "+name);
		}
		
		NativeObject function = (NativeObject) functions.get(name);

		if (function == null) {
			function = loadObject(pageName, fileName);
			functions.put(name, function);
		}
		ScriptableObject.putProperty(function.getParentScope(), "transaction",
				engine.getJsScope().get("transaction", engine.getJsScope()));

		return function;
	}

	private NativeObject loadObject(String pageName, String fileName)
			throws Throwable {
		String script = fileManager.getPageAttachmentAsString(pageName,
				fileName, login);

		String functionName = fileName.substring(0, fileName.indexOf('.'));
		script = script + "\n new " + functionName + "();";

		//JavascriptEngine engine = controller.getJavascriptEngine(controller.getSystemLogin());
		String name = pageName + "/" + fileName;
		NativeObject function = (NativeObject) engine.evaluateJavascript(name,
				script);

		functions.put(name, function);
		return function;
	}

	public StringBuffer getStringBuffer() {
		return new StringBuffer();
	}

	public Object getApi(String pageName) throws Throwable {
		if(!controller.getAuthorizer().isAuthorized(login, pageName, Authorizer.ACTION_UPDATE)) {
			throw new AuthenticationException("No update rights for Api "+pageName);
		}
		return controller.getApi(pageName);
	}

	public void refreshPluginManager() throws Throwable {
		controller.getLogger().info("Refreshing PluginManager");
		controller.updatePluginManager();
	}

	public JavascriptEngine.JavascriptProcessThread startJavascript(String scriptFileName, String script)
			throws Throwable {
		return engine.startJavascript(scriptFileName, script, false);
	}

	public List<String> getRunningThreads() {
		List<JavascriptEngine.JavascriptProcessThread> javascriptProcessThreads = engine.getRunningThreads();
		List<String> threadIds = new ArrayList();
		for(JavascriptEngine.JavascriptProcessThread thread: javascriptProcessThreads) {
			//try {
				//if (controller.getAuthorizer().isAuthorized(login, thread.getFileName(), Authorizer.ACTION_READ)) {
					threadIds.add(thread.getFileName() + ":" + thread.getStartTimeStamp());
				//}
			//} catch(IOException ioe) {
				//Do nothing
			//}
		}
		return threadIds;
	}

	public boolean stopThread(String threadId) {
		List<JavascriptEngine.JavascriptProcessThread> javascriptProcessThreads = engine.getRunningThreads();
		for(JavascriptEngine.JavascriptProcessThread thread: javascriptProcessThreads) {
			//try {
				//if (controller.getAuthorizer().isAuthorized(login, thread.getFileName(), Authorizer.ACTION_DELETE)) {
					if( (thread.getFileName() + ":" + thread.getStartTimeStamp()).equals(threadId)) {
						thread.stop();
						return true;
					}
				//}
			//} catch(IOException ioe) {
				//Do nothing
			//}
		}
		return false;
	}

	public void sleep(long time) {
		try {
			Thread.sleep(time);
		} catch (Exception e) {
		}
	}

	public String generateMD5(String input) {
		MessageDigest MD5;
		try {
			MD5 = MessageDigest.getInstance("MD5");
			MD5.update(input.getBytes());
			byte[] hash = MD5.digest();
			return DatatypeConverter.printHexBinary(hash);
		} catch (NoSuchAlgorithmException e) {
			e.printStackTrace();
		}
		return null;
	}
}
