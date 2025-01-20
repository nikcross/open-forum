package org.onestonesoup.javascript.engine;

import java.io.File;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.mozilla.javascript.Context;
import org.mozilla.javascript.ContextFactory;
import org.mozilla.javascript.EcmaError;
import org.mozilla.javascript.EvaluatorException;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.ScriptableObject;
import org.mozilla.javascript.WrappedException;
import org.onestonesoup.core.ExceptionHelper;
import org.onestonesoup.core.StringHelper;

public class JavascriptEngine {
	private static String GLOBAL = "global";

	private static List<JavascriptProcessThread> threads = new ArrayList<JavascriptProcessThread>();

	private JsContextFactory contextFactory = new JsContextFactory();
	private static Map<String, JsContext> scopes = new HashMap<String, JsContext>();

	private static final class JsContext extends Context {
		private long maximumScriptTime = 30000;
		private int maximumScriptInstructions = 1000000000;
		long startTime;
		long totalInstructions = 0;
		boolean stop = false;
		Scriptable scriptable;

		JsContext(ContextFactory contextFactory) {
			super(contextFactory);
			startTime = System.currentTimeMillis();
		}

		public void stop() {
			stop = true;
		}

		public void resetStartTime() {
			startTime = System.currentTimeMillis();
		}

		public long getMaximumScriptTime() {
			return maximumScriptTime;
		}

		public void setMaximumScriptTime(long maximumScriptTime) {
			this.maximumScriptTime = maximumScriptTime;
		}

		public int getMaximumScriptInstructions() {
			return maximumScriptInstructions;
		}

		public void setMaximumScriptInstructions(int maximumScriptInstructions) {
			this.maximumScriptInstructions = maximumScriptInstructions;
		}
	}

	class JsContextFactory extends ContextFactory {
		JsContext createContext() {
			JsContext context = new JsContext(this);
			context.setOptimizationLevel(-1);
			context.setInstructionObserverThreshold(1000);

			return context;
		}

		@Override
		protected void observeInstructionCount(Context context,
				int instructionCount) {
			((JsContext) context).totalInstructions += instructionCount;
			// System.out.println("inst:"+((JsContext)context).totalInstructions);

			if (((JsContext) context).stop == true) {
				throw new Error("Stop Requested");
			}
			if (((JsContext) context).maximumScriptTime > 0
					&& System.currentTimeMillis()
							- ((JsContext) context).startTime > ((JsContext) context).maximumScriptTime) {
				throw new Error("Too long");
			}
			if (((JsContext) context).maximumScriptInstructions > 0
					&& ((JsContext) context).totalInstructions > ((JsContext) context).maximumScriptInstructions) {
				throw new Error("Too many instructions");
			}
		}
	}

	private JsContextFactory jsContextFactory = new JsContextFactory();
	private Context jsContext;
	private Scriptable jsScope;

	public class JavascriptProcessThread implements Runnable {
		private String fileName;
		private String script;
		private boolean isCLI;
		private boolean running = false;
		private List<String> scriptQueue = new ArrayList<String>();
		private JsContext context;
		private long startTimeStamp;

		private JavascriptProcessThread(String fileName, String script,
				boolean isCLI) {
			this.fileName = fileName;
			this.script = script;
			this.isCLI = isCLI;

			/*
			 * if(isCLI) { setMaximumScriptInstructions(0);
			 * setMaximumScriptTime(0); }
			 */

			Thread thread = new Thread(this, fileName);
			thread.setPriority(Thread.MIN_PRIORITY);
			thread.start();
		}

		public void runScript(String script) {
			scriptQueue.add(script);
		}

		public void stop() {
			running = false;
			context.stop();
		}

		public String getFileName() {
			return fileName;
		}

		public String getScript() {
			return script;
		}

		public long getStartTimeStamp() {
			return startTimeStamp;
		}

		public void run() {
			running = true;
			startTimeStamp = System.currentTimeMillis();
			try {
				context = jsContextFactory.createContext();
				runJavascript(fileName, script, -1, -1, context);

				if (isCLI) {
					while (running) {
						if (scriptQueue.isEmpty()) {
							Thread.sleep(100);
						} else {
							script = scriptQueue.get(0);
							scriptQueue.remove(script);

							try {
								context = jsContextFactory.createContext();
								runJavascript(fileName, script, -1, -1, context);
							} catch (Throwable t) {
								t.printStackTrace();
							}
						}
					}
				}
			} catch (Throwable th) {
				th.printStackTrace();
			}
			threads.remove(this);
			running = false;
		}
	}

	public static JavascriptEngine getInstance() {
		JavascriptEngine engine = new JavascriptEngine();
		engine.getScope(GLOBAL);
		return engine;
	}

	public static JavascriptEngine getInstance(String scope) {
		JavascriptEngine engine = new JavascriptEngine();
		engine.getScope(scope);
		return engine;
	}

	private JsContext getScope(String scopeName) {
		JsContext context = scopes.get(scopeName);
		if (context != null) {
			return context;
		}
		context = contextFactory.createContext();
		if (scopeName.equals(GLOBAL)) {
			Scriptable scritable = context.initStandardObjects();
			context.scriptable = scritable;
		} else {
			Scriptable scritable = context
					.newObject(scopes.get(GLOBAL).scriptable);
			context.scriptable = scritable;
		}

		scopes.put(scopeName, context);
		return context;
	}

	public JavascriptEngine() {
		jsContext = Context.enter(); //jsContextFactory.createContext();

		jsScope = jsContext.initStandardObjects();

		try {
			jsContext.setClassShutter(new JavascriptClassShutter());
		} catch (SecurityException se) {
		}
	}

	public void mount(String alias, Object object) {
		if (object == null) {
			return;
		}
		jsContextFactory.enterContext(jsContext);
		Object wrappedOut = Context.toObject(object, jsScope);
		ScriptableObject.putProperty(jsScope, alias, wrappedOut);
	}

	public String getObjectKey(Object object) {
		// Scriptable scriptable = scopes.get(GLOBAL).scriptable;
		Scriptable scriptable = jsScope;
		String[] keys = getObjects();
		for (String key : keys) {
			if (scriptable.get(key, scriptable) == object) {
				return key;
			}
		}
		return null;
	}

	public Object getObject(String alias) {
		// return scopes.get(GLOBAL).scriptable.get(alias,
		// scopes.get(GLOBAL).scriptable);
		return jsScope.get(alias, jsScope);
	}

	public String[] getObjects() {
		// Object[] keyObjs = scopes.get(GLOBAL).scriptable.getIds();
		Object[] keyObjs = jsScope.getIds();
		String[] keys = new String[keyObjs.length];
		for (int i = 0; i < keys.length; i++) {
			keys[i] = (String) keyObjs[i];
		}
		return keys;
	}

	public JavascriptProcessThread startJavascript(String fileName, String script, boolean isCLI)
			throws Throwable {
		JavascriptProcessThread javascriptProcessThread = new JavascriptProcessThread(fileName, script, isCLI);
		threads.add( javascriptProcessThread );
		return javascriptProcessThread;
	}

	public List<JavascriptProcessThread> getRunningThreads() {
		return threads;
	}

	public String runJavascript(String fileName, String script)
			throws Throwable {
		return runJavascript(fileName, script, null, null, null);
	}

	public String runJavascript(
			String fileName,
			String script,
			final Integer maximumInstruactions,
			final Integer maximumTime,
			JsContext context
	) throws Throwable {
		try {
			if(context==null) {
				jsContext = jsContextFactory.createContext();
				JavascriptEngine.JsContext jContext = (JavascriptEngine.JsContext)jsContext;
				if (maximumTime == null) {
					jContext.resetStartTime();
					jContext.setMaximumScriptTime(-1);
				} else {
					jContext.setMaximumScriptTime(maximumTime);
				}
				if (maximumInstruactions == null) {
					jContext.resetStartTime();
					jContext.setMaximumScriptInstructions(-1);
				} else {
					jContext.setMaximumScriptInstructions(maximumInstruactions);
				}

			} else {
				jsContext = context;
				JavascriptEngine.JsContext jContext = (JavascriptEngine.JsContext)jsContext;
				if (maximumTime != null) {
					jContext.setMaximumScriptTime(maximumTime);
				}
				if (maximumInstruactions != null) {
					jContext.setMaximumScriptInstructions(maximumInstruactions);
				}
			}

			jsContextFactory.enterContext(jsContext);
			return Context.toString(jsContext.evaluateString(jsScope, script,
					"Javascript Engine", 1, null));
		} catch (WrappedException we) {
			String trace = StringHelper.arrayToString(
					ExceptionHelper.getTrace(we.getWrappedException()), "\n");

			String message = fileName + " Javascript Error [at "
					+ we.lineNumber() + ": " + we.columnNumber() + "]:" + trace;
			System.err.println(message);

			throw new Exception(message, we.getWrappedException());
		} catch (EvaluatorException ev) {
			System.err.println(fileName + " Javascript Error [at "
					+ ev.lineNumber() + ": " + ev.columnNumber() + "]:"
					+ ev.details());

			throw new Exception(fileName + " Javascript Error [at "
					+ ev.lineNumber() + ": " + ev.columnNumber() + "]:"
					+ ev.details());
		} catch (EcmaError ee) {
			System.err.println(fileName + " Javascript Error [at "
					+ ee.lineNumber() + ": " + ee.columnNumber() + "]:"
					+ ee.getErrorMessage());

			/*String file = new File(fileName).getName();
			String pageName = fileName.substring(0,
					fileName.length() - file.length());*/

			throw new Exception("Javascript Error [at " + ee.lineNumber() + ": "
					+ ee.columnNumber() + "]:" + ee.getErrorMessage() + " in "
					+ fileName);
		} catch (Exception e) {
			e.printStackTrace();
			throw e;
		}
	}

	public Object evaluateJavascript(String fileName, String script)
			throws Throwable {
		try {
			jsContext = Context.enter(); //jsContextFactory.createContext();
			//jsContext.resetStartTime();
			//jsContext.setMaximumScriptTime(-1);
			jsContextFactory.enterContext(jsContext);
			return jsContext.evaluateString(jsScope, script,
					"Javascript Engine", 1, null);
		} catch (WrappedException we) {
			String trace = StringHelper.arrayToString(
					ExceptionHelper.getTrace(we.getWrappedException()), "\n");
			throw we.getWrappedException();
		} catch (EvaluatorException ev) {
			System.err.println(fileName + " Javascipt Error [at "
					+ ev.lineNumber() + ": " + ev.columnNumber() + "]:"
					+ ev.details());

			throw new Exception(fileName + " Javascipt Error [at "
					+ ev.lineNumber() + ": " + ev.columnNumber() + "]:"
					+ ev.details());
		} catch (EcmaError ee) {
			System.err.println(fileName + " Javascipt Error [at "
					+ ee.lineNumber() + ": " + ee.columnNumber() + "]:"
					+ ee.getErrorMessage());

			String file = new File(fileName).getName();
			String pageName = fileName.substring(0,
					fileName.length() - file.length());

			throw new Exception(
					"<a href=\"/OpenForum/Actions/EditText?pageName="
							+ pageName + "&fileName=" + file + "\">" + fileName
							+ "</a> Javascipt Error [at " + ee.lineNumber()
							+ ": " + ee.columnNumber() + "]:"
							+ ee.getErrorMessage());
		} catch (Exception e) {
			e.printStackTrace();
			throw e;
		}
	}

	public Context getJsContext() {
		return jsContext;
	}

	public Scriptable getJsScope() {
		return jsScope;
	}
	
	public String toString() {
		String data = super.toString();
		data+="\n";
		for(String key: getObjects()) {
			data+= key + "=" +getObject(key)+"\n";
		}
		return data;
	}
}
