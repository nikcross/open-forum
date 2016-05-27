package org.onestonesoup.openforum.renderers;

import org.onestonesoup.core.data.EntityTree;
import org.onestonesoup.core.data.XmlHelper;
import org.onestonesoup.javascript.engine.JavascriptEngine;
import org.onestonesoup.openforum.controller.OpenForumController;
import org.onestonesoup.openforum.javascript.JavascriptExternalResourceHelper;
import org.onestonesoup.openforum.security.Login;

public class WikiExtensionRenderer implements WikiTagRenderer {

	public void render(String pageName,StringBuffer target, StringBuffer data,int count,OpenForumController controller,WikiLinkParser linkRenderer) {
		try {
			EntityTree element = XmlHelper.parseElement("<"+data.toString().replace('\'','\"')+"/>");
			Login ownerLogin = controller.getFileManager().getLoginForPageAuthor(pageName,controller.getSystemLogin());
			ownerLogin.setLoggedIn(true);

			String script = controller.getFileManager().getPageAttachmentAsString( "/OpenForum/Extensions/"+element.getName(),"renderer.sjs",ownerLogin );
			if(script!=null)
			{
				JavascriptEngine js =  controller.getJavascriptEngine(ownerLogin);
				JavascriptExternalResourceHelper externalHelper = new JavascriptExternalResourceHelper( controller.getFileManager(),ownerLogin );
				
				js.mount("pageName",pageName);
				js.mount("extension",element);
				js.mount("external",externalHelper);
				
				script = "function renderSJS() {"+script+"} renderSJS();";
				
				target.append( js.runJavascript("/OpenForum/Extensions/"+element.getName()+"/renderer.sjs",script) );
			}
		}
		catch(Throwable e)
		{
			target.append("Error parsing Extension tag [{"+data+"}]. Exception:"+e);
		}
	}

}
