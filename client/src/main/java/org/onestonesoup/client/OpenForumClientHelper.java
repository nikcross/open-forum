package org.onestonesoup.client;

import org.onestonesoup.javascript.cli.JavascriptCommandLineInterface;
import org.onestonesoup.javascript.engine.JSON;

/**
 * Created by nikcross on 30/07/17.
 */
public class OpenForumClientHelper {


	public OpenForumClient getClient(String host,String userId,String password, boolean hashedPassword) throws Exception {
		return new OpenForumClient(host,userId,password,hashedPassword);
	}

	public OpenForumMessageQueueClient getMessageQueueClient(String host,String userId,String password,boolean hashedPassword,String queue) throws Exception {
		return new OpenForumMessageQueueClient(host,userId,password,hashedPassword,queue);
	}

	public MessageQueueListener getJavascriptListener(JavascriptCommandLineInterface.JSInterface js, String functionName) {
		return new MessageQueueListener() {
			@Override
			public void processMessage(String from, String message) {
                try {
                	message = message.replace("\"","\\\"");
					System.out.println("js.run => " + functionName + "('" + from + "','" + message + "');");
                    js.run(functionName + "(\"" + from + "\",\"" + message + "\");");
                } catch (Throwable throwable) {
                    System.out.println("Failed to run " + functionName + "('" + from + "','" + message + "');");
                    throwable.printStackTrace();
                }
            }
		};
	}
}
