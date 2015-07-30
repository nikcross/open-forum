package org.onestonesoup.openforum.trigger;

import org.onestonesoup.openforum.controller.OpenForumController;

public class RebuildTrigger extends Trigger{

	public RebuildTrigger(OpenForumController controller)
	{
		super(controller);
	}
	
	public String getPageName() {
		return "/OpenForum/Triggers/RebuildTrigger";
	}

}
