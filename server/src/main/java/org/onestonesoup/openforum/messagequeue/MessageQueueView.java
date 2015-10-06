package org.onestonesoup.openforum.messagequeue;

import org.onestonesoup.openforum.plugin.SystemAPI;

public class MessageQueueView extends SystemAPI {

	private MessageQueueManager getQueueManager() {
		return getController().getQueueManager();
	}
	
	public int getTotalQueuedMessages() {
		
		int messages = 0;
		for(String queueName: getQueueManager().getQueueNames()) {
			messages += getQueueManager().getQueue(queueName).getMessagesCount();
		}
		
		return messages;
	}
	
	public String[] getQueueNames() {
		return getQueueManager().getQueueNames().toArray(new String[]{});
	}
	
	public int getMessagesInQueue(String queueName) {
		return getQueueManager().getQueue(queueName).getMessagesCount();
	}
}
