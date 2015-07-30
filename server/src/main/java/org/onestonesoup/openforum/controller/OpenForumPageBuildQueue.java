package org.onestonesoup.openforum.controller;

import java.util.ArrayList;
import java.util.List;

public class OpenForumPageBuildQueue implements Runnable{

	public class Queue {

		private List<String> list = new ArrayList<String>();
		
		public void post(String entry) {
			list.add(entry);
		}

		public void add(int index, String entry) {
			list.add(index, entry);
		}

		public boolean isEmpty() {
			if(list.size()==0) {
				return true;
			} else {
				return false;
			}
		}

		public String get() {
			String entry = list.remove(0);
			return entry;
		}

	}
	
	private OpenForumController controller;
	private Queue queue;
	
	public OpenForumPageBuildQueue(OpenForumController controller)
	{
		this.controller = controller;
		this.queue = new Queue();
		
		new Thread(this,"Web Page Build Queue").start();
	}
	
	public void addPageToBuild(String title)
	{
		queue.post(title);
		controller.getLogger().info(title+" queued for building.");
	}
	
	public void pushToFrontPageToBuild(String title)
	{
		queue.add(0,title);
		controller.getLogger().info(title+" queued for building.");
	}	
	
	public void run()
	{
		while(true)
		{
			try{
				if(queue.isEmpty()==false)
				{
					String title = (String)queue.get();
					
					controller.buildPage(title,false);
				}
			}
			catch(Exception e)
			{
				e.printStackTrace();	
			}
			
			try{ Thread.sleep(100); }catch(Exception e){}
		}
	}
}
