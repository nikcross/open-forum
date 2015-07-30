package org.onestonesoup.openforum.trigger;

import org.onestonesoup.openforum.controller.OpenForumController;

public class StartUpTrigger extends Trigger{

	public StartUpTrigger(OpenForumController controller)
	{
		super(controller);
	}
	
	public String getPageName() {
		return "/OpenForum/Triggers/StartTrigger";
	}

}
