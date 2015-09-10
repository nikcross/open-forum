package org.onestonesoup.javascript.cli;

import java.awt.GraphicsEnvironment;
import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.lang.reflect.InvocationTargetException;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLClassLoader;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.onestonesoup.core.DirectoryHelper;
import org.onestonesoup.core.FileHelper;
import org.onestonesoup.core.process.logging.LogFile;
import org.onestonesoup.core.process.logging.SimpleLogFile;
import org.onestonesoup.javascript.engine.JSON;
import org.onestonesoup.javascript.engine.JavascriptEngine;
import org.onestonesoup.javascript.helper.JSHelp;
import org.onestonesoup.javascript.helper.JSMethodHelp;

public class JavascriptCommandLineInterface extends org.onestonesoup.core.process.CommandLineTool implements Runnable{

	private static JavascriptCommandLineInterface js;
	private static String[] initArgs = new String[]{};
	
	private List<String> history = new ArrayList<String>();
	
	public static void main(String[] args) {
		System.out.println( "Starting JavascriptCommandLineInterface "+getVersion() );
		initArgs = args;
		getInstance();
	}
	
	public static String getVersion() {
		return "v 1.0 beta";
	}
	
	public static JSInterface getInstance() {
		if(js==null) {
			js = new JavascriptCommandLineInterface(initArgs);
		}
		return js.jsInterface;
	}
	
	private JavascriptCommandLineInterface(String[] args) {
		super(args);
	}

	@Override
	public int getMinimumArguments() {
		return 0;
	}

	@Override
	public int getMaximumArguments() {
		return 1;
	}

	@Override
	public String getUsage() {
		return "[js-init-script-file]";
	}

	private JavascriptEngine jsEngine;
	private JSInterface jsInterface;
	private Thread thread;
	private static Map<String,URLClassLoader> classLoaders = new HashMap<String,URLClassLoader>();
	private LogFile logFile = null;
	
	public class JSInterface {
		private JavascriptEngine jsEngine;
		private JavascriptCommandLineInterface cli;
		public JSInterface(JavascriptCommandLineInterface cli,JavascriptEngine jsEngine) {
			this.jsEngine = jsEngine;
			this.cli = cli;
			new JSHelp().setJavascriptEngine(jsEngine);
		}
		
		@JSMethodHelp(signature = "alias, jarFile, className")
		public Object mountJar(String alias,String jarFile,String className) throws MalformedURLException, ClassNotFoundException, InstantiationException, IllegalAccessException {
			
			List<URL> urlList = new ArrayList<URL>();
			String[] jarFiles = jarFile.split(",");
			for(String file: jarFiles) {		
				File jar = new File(file);
				if(jar.exists()==false) {
					System.out.println("Jar "+jar.getAbsolutePath()+" does not exist.");
				}
				if(jar.isDirectory()) {
					List<File> jars = DirectoryHelper.findFiles(jar.getAbsolutePath(), ".*\\.jar", true);
					for(File j: jars) {
						System.out.println("added jar "+j.getAbsolutePath());
						URL jarURL = j.toURI().toURL();
						urlList.add(jarURL);
					}
				} else {
					System.out.println("added jar "+jar.getAbsolutePath());
					URL jarURL = jar.toURI().toURL();
					urlList.add(jarURL);
				}
			}
			
			URLClassLoader classLoader = new URLClassLoader( urlList.toArray(new URL[]{}) );
			classLoaders.put(alias,classLoader);
			
			if(className==null) {
				return null;
			} else {
				Class<?> clazz = classLoader.loadClass(className);
				Object instance = clazz.newInstance();
				jsEngine.mount(alias,instance);
				return instance;
			}
		}
		
		@JSMethodHelp(signature = "alias, className")
		public Object mount(String alias,String className) throws IllegalArgumentException, InvocationTargetException, SecurityException {
			Object obj;
			try {
				Class<?> clazz = Class.forName(className);
				obj = clazz.newInstance();
					try {
						clazz.getMethod("setJavascriptEngine", JavascriptEngine.class).
						invoke(obj, jsEngine);
					} catch (NoSuchMethodException e) {}
				jsEngine.mount(alias,obj);
				return obj;
			} catch (InstantiationException e) {
				e.printStackTrace();
			} catch (IllegalAccessException e) {
				e.printStackTrace();
			} catch (ClassNotFoundException e) {
				e.printStackTrace();
			}
			return null;
		}
		
		@JSMethodHelp(signature = "alias, object")
		public void mountObject(String alias,Object object) {
				jsEngine.mount(alias,object);
		}
		
		public String getObjectAlias(Object object) {
			return jsEngine.getObjectKey(object);
		}
		
		public Object run(String command) throws Throwable {
			try {
				return jsEngine.runJavascript("cli",command);
			} catch (Throwable e) {
				e.printStackTrace();
			}
			return null;
		}
		
		private Object runWithoutConstraint(String command) throws Throwable {
			try {
				return jsEngine.runJavascript("cli",command,-1,-1, null);
			} catch (Throwable e) {
				e.printStackTrace();
			}
			return null;
		}
		
		public Object runScript(String fileName) throws Throwable {
			try {
				return jsEngine.runJavascript( fileName,FileHelper.loadFileAsString(fileName) );
			} catch (Throwable e) {
				e.printStackTrace();
			}
			return null;
		}
		
		public void runAsync(String command) {
			new JSThread(command,null,this);
		}
		
		public void runScriptAsync(String fileName) throws IOException {
			String command = FileHelper.loadFileAsString(fileName);
			new JSThread(command,fileName,this);
		}
		
		public void sleep(long milliSeconds) throws InterruptedException {
			Thread.sleep(milliSeconds);
		}
		
		public String getParameter(int index) {
			return cli.getParameter(index);
		}
		
		public String getOption(String optionName) {
			return cli.getOption(optionName);
		}
		
		public void setCommandLog(String logFileName) {
			System.out.println( "Logging commands to "+new File(logFileName).getAbsolutePath() );
			logFile = new SimpleLogFile(logFileName);
		}
		
		public JavascriptEngine getEngine(String scopeName) {
			return JavascriptEngine.getInstance(scopeName);
		}
		
		public void help() {
			String[] objects = jsEngine.getObjects();
			
			System.out.println( "Objects:" );
			
			for(String object: objects) {
				System.out.println( "  "+object );
			}
		}
		
		public void help(String name) {
			Object object = jsEngine.getObject(name);
			help(object);
		}
		
		public void help(Object object) {
			help(object,null);
		}
		
		private void help(Object object,String name) {
			System.out.println(JSHelp.help(object, name));
		}
		
		public void history() {
			for(String line: history) {
				System.out.println("H:" + history.indexOf(line) + " = " + line);
			}
		}
		
		public boolean isHeadless() {
			return GraphicsEnvironment.isHeadless();
		}
		
		public void exit() {
			System.exit(0);
		}

		public Object getObject(String name) {
			return jsEngine.getObject(name);
		}
	}
	
	private class JSThread implements Runnable{
		JSInterface jsEngine;
		private String code;
		
		private JSThread(String code,String fileName,JSInterface jsEngine) {
			this.code = code;
			this.jsEngine = jsEngine;
			new Thread(this,"JS Thread").start();
		}
		public void run() {
			Object result;
			try {
				result = jsEngine.runWithoutConstraint(code);
				displayResult(result);
			} catch (Throwable e) {
				e.printStackTrace();
			}
		}
	}
	
	@Override
	public void process() {
		thread = new Thread(this,"Javascript Engine");
		thread.start();
	}
	
	public void run() {
		System.out.println("Starting Javascript CLI");
		
		jsEngine = JavascriptEngine.getInstance();
		jsInterface = new JSInterface(this,this.jsEngine);
		jsEngine.mount("js",jsInterface);
		jsEngine.mount("JSON",new JSON(jsEngine));
		jsEngine.mount("out",System.out);
		jsEngine.mount("err",System.err);
		
		try {
			InputStream iStream = this.getClass().getResourceAsStream("/init.js");
			if(iStream!=null) {
				String initScript = FileHelper.loadFileAsString( iStream  );
				if(initScript!=null) {
					try {
						jsEngine.runJavascript( "cli",initScript );
					} catch (Throwable e) {
						e.printStackTrace();
					}
				}
			}
		} catch (IOException e1) {
		}
		
		if(getParameter(0)!=null) {
			try {
				System.out.println("running "+new File(getParameter(0)).getAbsolutePath());
				jsEngine.runJavascript( getParameter(0), FileHelper.loadFileAsString(getParameter(0) ));
			} catch (IOException e) {
				e.printStackTrace();
			} catch (Throwable e) {
				e.printStackTrace();
			}
		}
		
		if(hasOption("noPrompt")==true) {
			return;
		}
		
		if(hasOption("log")) {
			jsInterface.setCommandLog( getOption("log") );
		}
		
		BufferedReader reader = new BufferedReader( new InputStreamReader(System.in) );
		try {
			System.out.print("JS> ");
			String line = reader.readLine();
			StringBuffer code = new StringBuffer();
			boolean bufferMode=false;
			
			while(line != null) {
				history.add(line);
				try {
					if(bufferMode==false) {
						if(line.equals("{{")) {
							bufferMode=true;
						} else if(line.startsWith("H:")) {
							int index = Integer.parseInt(line.substring(2));
							line = history.get(index);
							System.out.println(line);
							
							if(logFile!=null) {
								logFile.logMessage(line);
							}
							Object result = jsEngine.runJavascript("Historic User Input",line);
							displayResult(result);
						}else {
						
							if(logFile!=null) {
								logFile.logMessage(line);
							}
							Object result = jsEngine.runJavascript("User Input",line);
							displayResult(result);
						}
					} else {
						if(line.equals("}}")) {
							if(logFile!=null) {
								logFile.logMessage("{{\n"+code.toString()+"\n}}\n");
							}
							Object result = jsEngine.runJavascript(code.toString(),"User Input");
							displayResult(result);
							code=new StringBuffer();
							bufferMode=false;
						} else if(line.equals("}}+")) {
							if(logFile!=null) {
								logFile.logMessage("{{\n"+code.toString()+"\n}}+\n");
							}
							jsInterface.runAsync(code.toString());
							code=new StringBuffer();
							bufferMode=false;
						} else {
							code.append("\n"+line);
						}
					}
				} catch (Throwable e) {
					System.err.println(e.getMessage());
					code=new StringBuffer();
					bufferMode=false;
				}
				
				if(bufferMode) {
					System.out.print("JS+ ");
				} else {
					System.out.print("JS> ");
				}
				line = reader.readLine();
			}
			
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
	
	private void displayResult(Object result) {
		if(result==null) return;
		if(
				result instanceof String ||
				result instanceof Integer ||
				result instanceof Double
		) {
			System.out.println(result.toString());
		}
	}
}
