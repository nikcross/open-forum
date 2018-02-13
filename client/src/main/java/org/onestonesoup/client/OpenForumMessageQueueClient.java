package org.onestonesoup.client;

import java.io.IOException;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.List;
import org.onestonesoup.javascript.engine.JavascriptEngine;

/**
 * Created by nikcross on 13/06/17.
 */
public class OpenForumMessageQueueClient implements Runnable {

	private String queue;
	private Thread thread;
	private OpenForumClient client;
	private long lastTime = System.currentTimeMillis();
	private JavascriptEngine javascript;
	private boolean running;
	private List<MessageQueueListener> listeners;

	public static void main(String[] args) throws Exception {
		OpenForumMessageQueueClient client = new OpenForumMessageQueueClient(
				"https://open-forum.onestonesoup.org",
				args[0],
				args[1],
				args[2]
				);
		client.start();
	}

	public OpenForumMessageQueueClient(String host, String userId, String password, String queue) throws Exception {
		this.queue = queue;
		client = new OpenForumClient(host, userId, password);
		javascript = new JavascriptEngine();
		listeners = new ArrayList<MessageQueueListener>();
	}

	public void start() {
		if(running) return;
		thread = new Thread(this);
		thread.start();
	}

	public void stop() {
		running = false;
	}

	public String getQueue() {
		return queue;
	}

	public String getUserId() {
		return client.getUserId();
	}

	public void addListener(MessageQueueListener listener) {
		listeners.add(listener);
	}

	public void removeListener(MessageQueueListener listener) {
		listeners.remove(listener);
	}

	public void postMessage(String message) throws IOException {
		client.getFile("OpenForum","MessageQueue?action=push&queue=" + queue + "&message=" + URLEncoder.encode(message,"UTF-8"));
	}

	public void run() {
		if(running) return;
		running = true;
		while(running) {
			try {
				List<String> messages = pullMessages();

				for (String message : messages) {
					String user = message.substring(0,message.indexOf(":"));
					message = message.substring( message.indexOf(":")+1 );
					//System.out.println(user + ">" + message);

					for(MessageQueueListener listener: listeners) {
						listener.processMessage(user,message);
					}
				}

				if(messages.size()>0) {
					Thread.sleep(500);
				} else {
					Thread.sleep(5000);
				}
			} catch (Throwable t) {
				t.printStackTrace();
			}
		}
	}

	public void setQueueLastTime(long time) {
		lastTime = time;
	}

	private List<String> pullMessages() throws Throwable {
		//System.out.println("Downloading since "+lastTime);
		String jsonData = client.getFile("/OpenForum","MessageQueue?action=pull&queue=" + queue + "&since=" + lastTime);

		String script = "var response = "+jsonData+";";
		script += "for(var i in response.messages) messageList.add( response.messages[i] );";
		script += "qc.setQueueLastTime(response.timestamp);";

		List<String> messages = new ArrayList<String>();
		javascript.mount("messageList",messages);
		javascript.mount("qc",this);

		javascript.evaluateJavascript("OpenForumMessageQueueClient",script);

		//System.out.println("Downloaded " + messages.size() + " messages since "+lastTime);

		return messages;
	}
}
