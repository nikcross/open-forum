package org.onestonesoup.openforum.servlet;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;

import org.onestonesoup.core.data.EntityTree;
import org.onestonesoup.core.data.EntityTree.TreeEntity;
import org.onestonesoup.core.data.XmlHelper;
import org.onestonesoup.core.data.XmlHelper.XmlParseException;
import org.onestonesoup.openforum.controller.OpenForumController;
import org.onestonesoup.openforum.security.AuthenticationException;

public class OpenForumServletContextListener implements ServletContextListener {

	private static Map<String,OpenForumController> wikiControllers = new HashMap<String,OpenForumController>();
	
	public void contextDestroyed(ServletContextEvent event) {

	}

	public void contextInitialized(ServletContextEvent event) {
		File domainXml = new File(new File(event.getServletContext().getInitParameter("domainList")).getAbsolutePath());
		try {
			System.out.println("Configuring Wiki Controller");
			EntityTree domainList = XmlHelper.loadXml(domainXml);
			List<TreeEntity> domains = domainList.getChildren("domain");
			for(TreeEntity domain: domains) {
				String root = domain.getChild("root").getValue();
				String domainName = domain.getChild("host").getValue();

				System.out.println("  Adding Wiki Controller for "+domainName+" root:"+root);
				OpenForumController wikiController = new OpenForumController(root, domainName);
				wikiController.initialise();
				wikiControllers.put(domainName,wikiController);
				System.out.println("  Wiki Controller added for "+domainName);
			}
			if(domains.size()==0) {
				System.out.println("  No Wiki Controllers Listed");
			}
		} catch (XmlParseException e2) {
			// TODO Auto-generated catch block
			e2.printStackTrace();
		} catch (IOException e2) {
			// TODO Auto-generated catch block
			e2.printStackTrace();
		} catch (AuthenticationException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

	public static String[] getWikiControllerNames() {
		return wikiControllers.keySet().toArray(new String[]{});
	}
	
	public static OpenForumController getWikiController(String domain) {
		for(String key: wikiControllers.keySet()) {
			//System.out.println(domain+" matches "+key+" ?");
			if(domain.matches(key)) {
				//System.out.println("MATCH");
				return wikiControllers.get(key);
			}
		}
		//No match found
		return wikiControllers.get("default");
	}
}
