package org.onestonesoup.openforum.renderers;

import java.io.File;

import org.onestonesoup.core.data.EntityTree;
import org.onestonesoup.core.data.XmlHelper;
import org.onestonesoup.openforum.controller.OpenForumController;

public class WikiImageRenderer implements WikiTagRenderer {

	public void render(String pageName,StringBuffer target, StringBuffer data,int count,OpenForumController controller,WikiLinkParser linkRenderer) {
		
		try{
			EntityTree element = XmlHelper.parseElement("<element "+data.toString().replace('\'','\"')+"/>");
			String src = element.getAttribute("src");
			String caption = element.getAttribute("caption");
			String alt = caption;
			if(alt==null)
			{
				alt = new File(src).getName();
			}
			if(caption==null)
			{
				caption = "";
			}
			
			src = linkRenderer.parseLink(controller,src).href;
			
			target.append("<img src=\""+src+"\" alt=\""+alt+"\"/>");
			if(caption.length()>0)
			{
				target.append("<br/>"+caption);
			}
		}
		catch(Exception e)
		{
			target.append("Error parsing Image tag");
		}
	}

}
