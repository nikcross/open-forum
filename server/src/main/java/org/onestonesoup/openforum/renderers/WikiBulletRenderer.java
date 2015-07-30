package org.onestonesoup.openforum.renderers;

import org.onestonesoup.openforum.Renderer;
import org.onestonesoup.openforum.controller.OpenForumController;

public class WikiBulletRenderer implements WikiTagRenderer {

	private String type;
	public WikiBulletRenderer(String type)
	{
		this.type = type;
	}
	
	public void render(String pageName,StringBuffer target, StringBuffer data,int count,OpenForumController controller,
			WikiLinkParser linkRenderer) {

		StringBuffer part = new StringBuffer("<li>");
		Renderer.wikiToHtml(pageName,data.toString().trim()+"\n",part,controller,linkRenderer);
		part = new StringBuffer(part.toString().trim());
		part.append("</li>");
		
		if(part.indexOf("<"+type+">")>-1 && target.length()>4 && target.substring(target.length()-5,target.length()).equals("</li>"))
		{
			target.insert(target.length()-5,part.substring(4,part.length()-5));
		}
		else if(part.indexOf("<"+type+">")>-1 && target.length()>4 && target.substring(target.length()-5,target.length()).equals("</"+type+">"))
		{
			target.insert(target.length()-5,part.substring(4,part.length()-5));
		}
		else
		{
			target.append(part.toString());
		}

	}

}
