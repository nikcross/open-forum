package org.onestonesoup.openforum.renderers;

import org.onestonesoup.openforum.controller.OpenForumController;


public interface WikiTagRenderer {
	public void render(String pageName,StringBuffer target,StringBuffer data,int count,OpenForumController controller,WikiLinkParser linkRenderer);
}
