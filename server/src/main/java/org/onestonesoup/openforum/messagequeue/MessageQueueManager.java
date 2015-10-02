package org.onestonesoup.openforum.messagequeue;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

public class MessageQueueManager {
	private Map<String, MessageQueue> queues = new HashMap<String, MessageQueue>();

	public MessageQueueManager() {
	}

	public Set<String> getQueueNames() {
		return queues.keySet();
	}
	
	public MessageQueue getQueue(String name) {
		MessageQueue queue = (MessageQueue) queues.get(name);

		if (queue == null) {
			queue = new MessageQueue();
			queues.put(name, queue);
		}

		return queue;
	}

	public void cleanUpQueues() {
		Set<String> keys = queues.keySet();
		List<String> queuesToRemove = new ArrayList<String>();
		for (String key : keys) {
			MessageQueue q = (MessageQueue) queues.get(key);

			q.clean();
			if (q.isEmpty()) {
				queuesToRemove.add(key);
			}
		}
		for (String key : queuesToRemove) {
			queues.remove(key);
		}
	}
}
