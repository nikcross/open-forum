package org.onestonesoup.openforum.logger;

import java.io.IOException;
import java.io.OutputStream;
import java.io.PrintStream;

import org.onestonesoup.core.printstreams.OutMultiplexer;
import org.onestonesoup.openforum.controller.OpenForumController;

public class DefaultOpenForumLogger extends OutputStream implements OpenForumLogger {
	
	private StringBuffer buffer;
	private OpenForumController controller;
	private PrintStream out;
	
	public DefaultOpenForumLogger(OpenForumController controller) {
		this.buffer = new StringBuffer();
		this.controller = controller;
		this.out = System.out;
		OutMultiplexer.getMultiplexer().setDefaultStream(new PrintStream(this));
	}
	
	@Override
	public void error(String message) {
		out.println("error: " + message);
		controller.getQueueManager().getQueue("/OpenForum/System.error").postMessage(message, "System");
	}
	@Override
	public void info(String message) {
		out.println("info: " + message);
		controller.getQueueManager().getQueue("/OpenForum/System.info").postMessage(message, "System");

	}
	@Override
	public void debug(String message) {
		out.println("debug: " + message);
		controller.getQueueManager().getQueue("/OpenForum/System.debug").postMessage(message, "System");
	}
	@Override
	public void warning(String message) {
		out.println("warning: " + message);
		controller.getQueueManager().getQueue("/OpenForum/System.warning").postMessage(message, "System");
	}
	@Override
	public void test(String message) {
		out.println("test: " + message);
		controller.getQueueManager().getQueue("/OpenForum/System.test").postMessage(message, "System");
	}

	@Override
	public void write(int b) throws IOException {
		char c = (char)b;
		
		if(c=='\n') {
			String message = buffer.toString();
			buffer = new StringBuffer();
			
			if(message.startsWith("error: ")) {
				error(message.substring(7));
			} else if(message.startsWith("info: ")) {
				info(message.substring(6));
			} else if(message.startsWith("debug: ")) {
				debug(message.substring(7));
			} else if(message.startsWith("warning: ")) {
				warning(message.substring(9));
			} else if(message.startsWith("test: ")) {
				test(message.substring(6));
			} else {
				info(message);
			}
		} else {
			buffer.append(c);
		}
	}
}
