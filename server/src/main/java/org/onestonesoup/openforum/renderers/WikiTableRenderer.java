package org.onestonesoup.openforum.renderers;

import org.onestonesoup.core.StringHelper;
import org.onestonesoup.openforum.Renderer;
import org.onestonesoup.openforum.controller.OpenForumController;

public class WikiTableRenderer implements WikiTagRenderer {

	public void render(String pageName,StringBuffer target, StringBuffer data,int count,OpenForumController controller,
			WikiLinkParser linkRenderer) {
		
		String cellClass = "wikiTableCell";
		
		if(count==0)
		{
			target.append("<tr class=\"wikiTableTitle\">");
			cellClass = "wikiTableTitle";
		}
		else if(count%2==1)
		{
			target.append("<tr class=\"wikiTableEvenRow\">");
		}
		else
		{
			target.append("<tr class=\"wikiTableOddRow\">");
		}
		
		String[] fields = StringHelper.split( data.toString(),"|","[","]");
		
		for(int loop=0;loop<fields.length;loop++)
		{
			target.append("<td class=\""+cellClass+"\">");
			Renderer.wikiToHtml(pageName,fields[loop].trim(),target,controller,linkRenderer);
			target.append("</td>");
		}
		
		target.append("</tr>\n");

	}

}
