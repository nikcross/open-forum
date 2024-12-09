package org.onestonesoup.javascript.helper;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.onestonesoup.core.process.ProcessWatch;
import org.onestonesoup.core.process.ProcessWatcher;
import org.onestonesoup.javascript.engine.JSON;
import org.onestonesoup.javascript.engine.JavascriptEngine;

public class Process {

	private JavascriptEngine javascriptEngine;
	private JSON json;
	private List<ProcessBuilder> processes = new ArrayList<ProcessBuilder>();
	
	public void setJavascriptEngine(JavascriptEngine javascriptEngine) {
		this.javascriptEngine = javascriptEngine;
		this.json = new JSON(javascriptEngine);
	}
	
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
		private long startTimeStamp;
		
		private ProcessBuilder(String exec) {
			this.exec = exec;
			startTimeStamp = System.currentTimeMillis();
			processWatch = new ProcessWatch();
		}

		public long getStartTimeStamp() {
			return startTimeStamp;
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

		public String getExec() {
			return exec;
		}

		public void stop() throws InterruptedException {
			processWatch.kill();
		}

		public String run(boolean synchronous) throws Exception {
			if(synchronous) {
				buffer = new StringBuffer();
				ended = false;
				processWatch.addMatcher(".*", this);
			} else {
				processWatch.addMatcher("#NO MATCHES#", this);
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
		
		public String runInDirectory(String directory,boolean synchronous) throws Throwable {
			try {
				if (synchronous) {
					buffer = new StringBuffer();
					ended = false;
					processWatch.addMatcher(".*", this);
				} else {
					processWatch.addMatcher("#NO MATCHES#", this);
				}

				processWatch.executeInDirectory(directory, exec);

				if (synchronous) {
					while (ended == false) {
						Thread.sleep(100);
					}
					return buffer.toString();
				} else {
					return null;
				}
			} catch(Throwable t) {
				processes.remove(this);
				throw t;
			}
		}

		@Override
		public void processMatch(String data) {
			buffer.append(data+"\n");
		}

		@Override
		public void processEnd(int exitValue) {
			processes.remove(this);
			ended = true;
		}
	}
	
	public ProcessBuilder createProcess(String exec) {
		
		ProcessBuilder processBuilder = new ProcessBuilder(exec);
		processes.add(processBuilder);
		return processBuilder;
	}

	public List<String> getRunningProcesses() {
		List<String> list = new ArrayList();
		for(ProcessBuilder processBuilder: processes) {
			list.add(processBuilder.getExec()+":"+processBuilder.getStartTimeStamp());
		}
		return list;
	}

	public ProcessBuilder getProcess(String exec) {

		ProcessBuilder processBuilder = null;
		for(ProcessBuilder testProcessBuilder: processes) {
			if((testProcessBuilder.getExec()+":"+testProcessBuilder.getStartTimeStamp()).equals(exec)) {
				processBuilder = testProcessBuilder;
				break;
			}
		}
		if(processBuilder==null) {
				processBuilder = new ProcessBuilder(exec);
				processes.add(processBuilder);
		}
		
		return processBuilder;
	}
}
