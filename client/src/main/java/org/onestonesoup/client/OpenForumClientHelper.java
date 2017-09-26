package org.onestonesoup.client;

/**
 * Created by nikcross on 30/07/17.
 */
public class OpenForumClientHelper {


	public OpenForumClient getClient(String host,String userId,String password) throws Exception {
		return new OpenForumClient(host,userId,password);
	}

	public OpenForumMessageQueueClient getMessageQueueClient(String host,String userId,String password,String queue) throws Exception {
		return new OpenForumMessageQueueClient(host,userId,password,queue);
	}
}
