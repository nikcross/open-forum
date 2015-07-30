package org.onestonesoup.openforum.trigger;

import org.onestonesoup.openforum.controller.OpenForumController;

public class PageChangeTrigger extends Trigger {

	public PageChangeTrigger(OpenForumController controller) {
		super(controller);
	}

	public String getPageName() {
		return "/OpenForum/Triggers/PageChangeTrigger";
	}

}
