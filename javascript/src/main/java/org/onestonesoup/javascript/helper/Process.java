package org.onestonesoup.javascript.helper;

import java.util.HashMap;
import java.util.Map;

import org.onestonesoup.core.process.ProcessWatch;
import org.onestonesoup.core.process.ProcessWatcher;
import org.onestonesoup.javascript.engine.JSON;
import org.onestonesoup.javascript.engine.JavascriptEngine;

public class Process {

	private JavascriptEngine javascriptEngine;
	private JSON json;
	
	public void setJavascriptEngine(JavascriptEngine javascriptEngine) {
		this.javascriptEngine = javascriptEngine;
		this.json = new JSON(javascriptEngine);
	}

	private Map<String,ProcessBuilder> processes = new HashMap<String,ProcessBuilder>();
	
	public class MatchAction implements ProcessWatcher {

		public MatchAction(String exec,String matcher,String matchScript,String endScript) {
			this.exec = exec;
			this.matcher = matcher;
			this.matchScript = matchScript;
			this.endScript = endScript;
		}
		
		private String matcher;
		private String matchScript;
		private String endScript;
		private String exec;
		
		@Override
		public void processMatch(String data) {
			if(matchScript!=null) {
				try {
					data = json.stringify(data).toString();
					javascriptEngine.evaluateJavascript("Process "+exec+" (matcher='"+matcher+"')",matchScript+"("+data+");");
				} catch (Throwable e) {
					e.printStackTrace();
				}
			}
		}

		@Override
		public void processEnd(int exitCode) {
			if(endScript!=null) {
				try {
					javascriptEngine.evaluateJavascript("Process "+exec+" (end)", endScript+"("+exitCode+");");
				} catch (Throwable e) {
					e.printStackTrace();
				}
			}
		}
		
	}
	
	public class ProcessBuilder implements ProcessWatcher {
		private String exec;
		private ProcessWatch processWatch;
		private Map<String,MatchAction> matchers = new HashMap<String,MatchAction>();
		private StringBuffer buffer;
		private boolean ended = false;
		
		private ProcessBuilder(String exec) {
			this.exec = exec;
			processWatch = new ProcessWatch();
		}
		
		public ProcessBuilder onMatch(String matcher,String function) {
			MatchAction matcherAction = new MatchAction(exec,matcher,function,null);
			processWatch.addMatcher(matcher, matcherAction);
			matchers.put(matcher, matcherAction);
			
			return this;
		}
		
		public ProcessBuilder onEnd(String script) {
			MatchAction matcherAction = new MatchAction(exec,"",null,script);
			processWatch.addMatcher("onEnd", matcherAction);
			matchers.put("onEnd", matcherAction);
			
			return this;
		}
		
		public String run(boolean synchronous) throws Exception {
			if(synchronous) {
				buffer = new StringBuffer();
				ended = false;
				processWatch.addMatcher(".*", this);
			}
			
			processWatch.execute(exec);
			
			if(synchronous) {
				while(ended==false) {
					Thread.sleep(100);
				}
				return buffer.toString();
			} else {
				return null;
			}
		}
		
		public String runInDirectory(String directory,boolean synchronous) throws Exception {
			if(synchronous) {
				buffer = new StringBuffer();
				ended = false;
				processWatch.addMatcher(".*", this);
			}
			
			processWatch.executeInDirectory(directory,exec);
			
			if(synchronous) {
				while(ended==false) {
					Thread.sleep(100);
				}
				return buffer.toString();
			} else {
				return null;
			}
		}

		@Override
		public void processMatch(String data) {
			buffer.append(data+"\n");
		}

		@Override
		public void processEnd(int exitValue) {
			ended = true;
		}
	}
	
	public ProcessBuilder createProcess(String exec) {
		
		ProcessBuilder processBuilder = new ProcessBuilder(exec);
		processes.put(exec,processBuilder);
		return processBuilder;
	}
	
	public ProcessBuilder getProcess(String exec) {
		
		ProcessBuilder processBuilder = processes.get(exec);
		if(processBuilder==null) {
				processBuilder = new ProcessBuilder(exec);
				processes.put(exec,processBuilder);
		}
		
		return processBuilder;
	}
}
