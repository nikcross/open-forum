package org.onestonesoup.openforum.messagequeue;

import org.onestonesoup.core.data.EntityTree;

public class QueuedMessageItem {
	private long timeStamp;
	private EntityTree.TreeEntity item;
	
	public QueuedMessageItem(EntityTree.TreeEntity item,String owner)
	{
		this.item = item;
		this.item.setAttribute("owner",owner);
		timeStamp = System.currentTimeMillis();
	}

	public EntityTree.TreeEntity getItem() {
		return item;
	}

	public String getOwner() {
		return item.getAttribute("owner");
	}

	public long getTimeStamp() {
		return timeStamp;
	}
}
