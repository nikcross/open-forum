package org.onestonesoup.openforum.renderers;

import java.io.File;

import org.onestonesoup.core.FileHelper;
import org.onestonesoup.openforum.controller.OpenForumController;

public class WikiLinkRenderer implements WikiTagRenderer {
	
	public void render(String pageName,StringBuffer target, StringBuffer data,int count,OpenForumController controller,WikiLinkParser linkParser) {
		
		try{
			//System.out.println("Link from "+pageName+" to "+data);
			
			WikiLink link = linkParser.parseLink(controller,data.toString());
			
			String extension = FileHelper.getExtension( link.href );
			if( extension.length()!=0 && link.href.indexOf("javascript:")!=0 && link.href.indexOf("/OpenForum/Actions/Edit?")==-1 && link.external==false && controller.getFileManager().pageExists(link.href,controller.getSystemLogin())==false )
			{
				String fileName = new File( data.toString() ).getName();
				
				String linkData = controller.getFileManager().getFileTemplate(link.href,link.displayName,pageName,fileName,"link.html.fragment");
				target.append( linkData );
			}
			else
			{
				if(link.anchor.length()>0)
				{
					link.href+=link.anchor;
				}
				if(link.parameters.length()>0)
				{
					link.href+=link.parameters;
				}
				
				if(link.external==true)
				{
					if( isImage( link.href ) )
					{
					 target.append( "<img src=\""+link.href+"\"/>" );	
					 target.append("<a href=\""+link.href+"\" title=\""+link.href+"\" onclick=\"window.open('"+link.href+"');return false;\"><img src=\"/OpenForum/Images/icons/gif/link_go.gif\" border=\"0\" class=\"node\"></a>");
					}
					else
					{
					 target.append("<a href=\""+link.href+"\" title=\""+link.href+"\" onclick=\"window.open('"+link.href+"');return false;\">"+link.displayName+" <img src=\"/OpenForum/Images/icons/gif/link_go.gif\" border=\"0\" class=\"node\"></a>");
					}
				}
				else
				{
					if(link.href.indexOf("/OpenForum/Actions/Edit?")!=-1)
					{
						String missingPageName = link.href.substring( 33 );
						target.append("<a href=\""+link.href+"\" title=\"The page "+missingPageName+" does not exist. Click to create this page.\">"+link.displayName+"</a>");
					}
					else
					{
						target.append("<a href=\""+link.href+"\" title=\""+link.href+"\">"+link.displayName+"</a>");
					}
				}
			}
		}
		catch(Exception e)
		{
			target.append("["+data+"]");
		}
	}

	private boolean isImage(String href) {
		if(href.toLowerCase().endsWith(".gif") || href.toLowerCase().endsWith(".jpg") || href.toLowerCase().endsWith("png")) {
			return true;
		} else {
			return false;
		}
	}

}