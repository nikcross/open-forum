package org.onestonesoup.openforum.javascript;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HashMap;
import java.util.Map;

import org.mozilla.javascript.NativeObject;
import org.mozilla.javascript.ScriptableObject;
import org.onestonesoup.javascript.engine.JavascriptEngine;
import org.onestonesoup.openforum.controller.OpenForumController;
import org.onestonesoup.openforum.filemanager.FileManager;
import org.onestonesoup.openforum.security.Login;

public class JavascriptHelper {
	private static final char[] HEX_ARRAY = "0123456789ABCDEF".toCharArray();

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
				fileName, controller.getSystemLogin());

		String functionName = fileName.substring(0, fileName.indexOf('.'));
		script = script + "\n new " + functionName + "();";

		JavascriptEngine engine = controller.getJavascriptEngine(controller
				.getSystemLogin());
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
		return controller.getApi(pageName);
	}

	public void refreshPluginManager() throws Throwable {
		controller.getLogger().info("Refreshing PluginManager");
		controller.updatePluginManager();
	}

	public void startJavascript(String scriptFileName, String script)
			throws Throwable {
		engine.startJavascript(scriptFileName, script, false);
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
			return bytesToHex(hash);
		} catch (NoSuchAlgorithmException e) {
			e.printStackTrace();
		}
		return null;
	}

	public static String bytesToHex(byte[] bytes) {
		char[] hexChars = new char[bytes.length * 2];
		for (int j = 0; j < bytes.length; j++) {
			int v = bytes[j] & 0xFF;
			hexChars[j * 2] = HEX_ARRAY[v >>> 4];
			hexChars[j * 2 + 1] = HEX_ARRAY[v & 0x0F];
		}
		return new String(hexChars);
	}
}
