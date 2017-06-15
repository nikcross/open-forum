package org.onestonesoup.client;

/**
 * Created by nikcross on 13/06/17.
 */
public interface MessageQueueListener {

	public void processMessage(String from, String message);
}
