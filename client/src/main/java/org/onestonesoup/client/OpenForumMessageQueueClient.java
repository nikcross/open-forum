package org.onestonesoup.client;

import java.io.IOException;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.HashMap;
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
				false,
				args[2]
				);
		client.start();
	}

	public OpenForumMessageQueueClient(String host, String userId, String password, boolean hashedPassword, String queue) throws Exception {
		this.queue = queue;
		client = new OpenForumClient(host, userId, password, hashedPassword);
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
		try {
			HashMap<String,String> postData = new HashMap();
			postData.put("queue",queue);
			postData.put("message",URLEncoder.encode(message, "UTF-8"));

			client.doPost("OpenForum/MessageQueue",postData);

		} catch(IOException e) {
			e.printStackTrace();

			client.reSignIn();
			client.getFile("OpenForum", "MessageQueue?action=push&queue=" + queue + "&message=" + URLEncoder.encode(message, "UTF-8"));
		}
	}

	public void run() {
		int errorCount = 0;

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
					Thread.sleep(2000); // 2 seconds because has more messages
				} else {
					Thread.sleep(5000); // 5 seconds because no messages
				}

				errorCount = 0;
			} catch (Throwable t) {
				errorCount ++;
				t.printStackTrace();
				try {
					Thread.sleep(15000); // 15 seconds because of error
				} catch (InterruptedException e) {
					e.printStackTrace();
				}
				System.out.println("Error count " + errorCount);

				if(errorCount>10) {
					System.out.println("Trying to re-log in");
					client.reSignIn();
				} if(errorCount>20) {
					System.out.println("Slowing down message pull attempts");
					try {
						Thread.sleep(120000); // 2 minutes because of repeated errors
					} catch (InterruptedException e) {
						e.printStackTrace();
					}
				}
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
