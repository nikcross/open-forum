package org.onestonesoup.openforum.renderers;

import java.text.SimpleDateFormat;
import java.util.Date;

import org.onestonesoup.core.data.EntityTree;
import org.onestonesoup.core.data.XmlHelper;
import org.onestonesoup.openforum.controller.OpenForumController;

public class WikiTimeRenderer implements WikiTagRenderer {

	public void render(String pageName,StringBuffer target, StringBuffer data,int count,OpenForumController controller,WikiLinkParser linkRenderer) {
		try{
			EntityTree element = XmlHelper.parseElement("<element "+data.toString().replace('\'','\"')+"/>");
	
			String format = element.getAttribute("format");
			
			SimpleDateFormat date = new SimpleDateFormat(format);
			String dateString = date.format(new Date());
			
			target.append( dateString );
		}
		catch(Exception e)
		{
			target.append("Error parsing Page Insert tag");
		}
	}

}
