package org.onestonesoup.openforum.messagequeue;

import java.util.ArrayList;
import java.util.List;

import static org.onestonesoup.core.constants.TimeConstants.*;
import org.onestonesoup.core.data.EntityTree;

public class MessageQueue {

	private List<QueuedMessageItem> queue;
	private long ttl = MINUTE;
	private int maximumMessages = 100;

	public MessageQueue() {
		queue = new ArrayList<QueuedMessageItem>();
	}

	public void postMessage(String message, String owner) {
		EntityTree.TreeEntity xMessage = new EntityTree("message").getRoot();
		xMessage.setValue(message);
		postItem(xMessage, owner);
	}

	public void postItem(EntityTree.TreeEntity item, String owner) {
		QueuedMessageItem queuedItem = new QueuedMessageItem(item, owner);

		while(queue.size()>=maximumMessages) {
			queue.remove(0);
		}
		queue.add(queuedItem);
	}

	public int getMessagesCount() {
		return queue.size();
	}

	public void setEmpty() {
		queue = new ArrayList<QueuedMessageItem>();
	}

	public void setTTL(long time) {
		ttl = time;
	}

	public EntityTree.TreeEntity getItemsSince(long time) {
		EntityTree.TreeEntity result = new EntityTree("queue").getRoot();
		for (int loop = 0; loop < queue.size(); loop++) {
			QueuedMessageItem qItem = queue.get(loop);
			if (qItem.getTimeStamp() > time) {
				result.addChild(qItem.getItem());
			}
		}
		return result;
	}

	public void clean() {
		long time = System.currentTimeMillis();
		for (int loop = 0; loop < queue.size(); loop++) {
			QueuedMessageItem qItem = queue.get(loop);
			if ((time - qItem.getTimeStamp()) > ttl) {
				queue.remove(qItem);
			}
		}
	}

	public boolean isEmpty() {
		if (queue.size() == 0) {
			return true;
		} else {
			return false;
		}
	}
}
