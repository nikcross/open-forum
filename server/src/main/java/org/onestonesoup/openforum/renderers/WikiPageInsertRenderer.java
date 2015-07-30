package org.onestonesoup.openforum.renderers;

import java.util.ArrayList;
import java.util.List;

import org.onestonesoup.core.data.EntityTree;
import org.onestonesoup.core.data.XmlHelper;
import org.onestonesoup.openforum.Renderer;
import org.onestonesoup.openforum.controller.OpenForumController;
import org.onestonesoup.openforum.security.Login;

public class WikiPageInsertRenderer implements WikiTagRenderer {

	public void render(String pageName,StringBuffer target, StringBuffer data,int count,OpenForumController controller,WikiLinkParser linkRenderer)
	{
		
		try{
			EntityTree element = XmlHelper.parseElement("<element "+data.toString().replace('\'','\"')+"/>");
			String insertPageName = element.getAttribute("page");
			
			Login ownerLogin = controller.getFileManager().getLoginForPageAuthor(insertPageName,controller.getSystemLogin());
			ownerLogin.setLoggedIn(true);

			String section = element.getAttribute("section");
			
			if(insertPageName.charAt(0)=='.')
			{
				insertPageName = pageName+'/'+insertPageName;
			}
			
			String pageData = "";
			if( controller.getFileManager().pageAttachmentExists(insertPageName,"page.wiki",ownerLogin) )
			{
				pageData = controller.getFileManager().getPageSourceAsString(insertPageName,ownerLogin);
			}
			StringBuffer page = new StringBuffer();
			List<String> sections = new ArrayList<String>();
						
			if(section!=null)
			{
				Renderer.wikiToHtml( insertPageName,pageData,page,controller,linkRenderer,sections );

				int sectionNumber = Integer.parseInt(section)-1;
				if(sectionNumber<sections.size())
				{
					target.append( sections.get(sectionNumber).toString() );
				}
			}
			else
			{
				String pageHtml = "";
				if( controller.getFileManager().pageAttachmentExists( insertPageName,"page.html.fragment",ownerLogin ) )
				{
					pageHtml = controller.getFileManager().getPageAttachmentAsString( insertPageName,"page.html.fragment",ownerLogin );
				}
				target.append( pageHtml );
			}
		}
		catch(Exception e)
		{
			target.append("Error parsing Page Insert tag");
		}
	}

}
