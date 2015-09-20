package org.onestonesoup.openforum.renderers;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.onestonesoup.core.TemplateHelper;
import org.onestonesoup.core.data.KeyValuePair;
import org.onestonesoup.openforum.OpenForumNameHelper;
import org.onestonesoup.openforum.controller.OpenForumConstants;
import org.onestonesoup.openforum.controller.OpenForumController;
import org.onestonesoup.openforum.javascript.JavascriptHelper;
import org.onestonesoup.openforum.security.AuthenticationException;

public class WikiLinkParser implements OpenForumConstants {

	public String pageName;
	public Map<String,String> attachmentLinks = new HashMap<String,String>();
	public String editPageLink;
	public String editPageTemplate;
	private OpenForumController controller;
	
	public WikiLinkParser(String pageName,String editPageLink,String editPageTemplate,OpenForumController controller) throws Exception,AuthenticationException
	{
		this.pageName = pageName;
		this.editPageLink = editPageLink;
		this.editPageTemplate = editPageTemplate;
		this.attachmentLinks = getAttachmentsForPage(controller);
		this.controller = controller;
	}
	
	public WikiLink parseLink(OpenForumController controller,String data) throws Exception,AuthenticationException
	{
		String href = data;
		String displayName = data;
		String anchor="";
		String parameters="";
		boolean external = false;
		
		if(data.indexOf('|')>-1)
		{
			displayName = data.substring(0,data.indexOf('|'));
			href = data.substring(data.indexOf('|')+1);
		}
		
		if(href.indexOf("://")!=-1)
		{
			href = href.trim();
			external=true;
		}
		else if(href.indexOf(':')!=-1)
		{
			String[]parts = href.split(":");
			
			href = controller.getAliasLink(parts[0]);
			Map<String,String> maskParameters = new HashMap<String,String>();
			maskParameters.put("request",parts[1]);
			if(href==null)
			{
				href = "";
			}
			else
			{
				href = TemplateHelper.generateStringWithTemplate(href,maskParameters);
			}
			external=true;
			
			controller.addExternalLink(href);
		}
		else
		{
			if(getWikiLink(href)!=null)
			{
				href = getWikiLink(href);
				if(href.charAt(0)!='/')
				{
					href="/"+href;
				}
			}
			else if(getAttachmentLink(href)!=null)
			{
				href = getAttachmentLink(href);
			}			
			else
			{
				String wikiHref = href;
				if(wikiHref.indexOf('#')>-1)
				{
					anchor = wikiHref.substring( wikiHref.indexOf("#") );
					wikiHref = wikiHref.substring( 0,wikiHref.indexOf("#") );
					
					if(wikiHref.length()==0)
					{
						href="";
						return new WikiLink(displayName,href,anchor,parameters,external);
					}
				}
				if(wikiHref.indexOf('?')>-1 && external==false)
				{
					parameters = wikiHref.substring( wikiHref.indexOf("?") );
					wikiHref = wikiHref.substring( 0,wikiHref.indexOf("?") );
				}				

				/*if(wikiHref.charAt(0)=='/')
				{
					wikiHref = wikiHref.substring(1);
				}*/
				wikiHref = OpenForumNameHelper.titleToWikiName(wikiHref);

				if(getWikiLink(wikiHref)==null)
				{
					if(wikiHref.indexOf('/')!=-1)
					{
						String pageName = wikiHref.substring( 0,wikiHref.lastIndexOf('/') );
						String fileName = wikiHref.substring( wikiHref.lastIndexOf('/') );
						if( controller.getFileManager().pageAttachmentExists(pageName,fileName,controller.getSystemLogin()) )
						{
							displayName = wikiHref;
							href = wikiHref;
							
							WikiLink link = new WikiLink(displayName,href,anchor,parameters,false);
							return link;
						}
					}
					
					String valid = OpenForumNameHelper.validateWikiTitle(wikiHref);
					
					if( valid.equals("OK")==false )
					{
						valid = valid.replace("\"","&quot;");
					    href="javascript:ui.showAlert('Invalid Wiki Page Name','A Wiki page name "+valid+"');";
						controller.addMissingPage(wikiHref,pageName);
						
					    displayName = displayName+" is an invalid page name.";
					}
					else
					{
						boolean isDynamic = false;
						List<KeyValuePair> dynamicPages = controller.getDynamicPagesList();
						if(dynamicPages!=null)
						{
							for(int loop=0;loop<dynamicPages.size();loop++)
							{
								KeyValuePair dynamicPage = dynamicPages.get(loop);
								if( wikiHref.matches(dynamicPage.getKey()) )
								{
									isDynamic=true;
									break;
								}
							}
						}
						
						if(isDynamic==false)
						{
							controller.addMissingPage(wikiHref,pageName);
						
							href=editPageLink+wikiHref;
							Map<String,String> templateData = new HashMap<String,String>();
							templateData.put("displayName",displayName);
							displayName = TemplateHelper.generateStringWithTemplate(editPageTemplate,templateData);
						}
						else
						{
							displayName = wikiHref;
							href = wikiHref;
							
							WikiLink link = new WikiLink(displayName,href,anchor,parameters,false);
							return link;
						}
					}
				}
				else
				{
					href=getWikiLink(wikiHref);
				}
			}
		}
		
		WikiLink link = new WikiLink(displayName,href,anchor,parameters,external);
		
		return link;
	}
	
	public Map<String,String> getAttachmentsForPage(OpenForumController controller) throws Exception,AuthenticationException
	{
		Map<String,String> links = controller.getFileManager().getPageAttachments(pageName,controller.getSystemLogin());
		
		return links;
	}
	
	private String getWikiLink(String wikiHref) throws AuthenticationException, Exception
	{
		String link = null;
		if(wikiHref==null || wikiHref.length()==0)
		{
			return null;
		}
		
		if( controller.getFileManager().attachmentExists(wikiHref, PAGE_FILE, controller.getSystemLogin()))
		{
			link = OpenForumNameHelper.titleToWikiName(wikiHref);
		}
		else
		{
			try{
			if(controller.getFileManager().attachmentExists(wikiHref,controller.getSystemLogin()))
			{
				return wikiHref;
			}
			}
			catch(Exception e)
			{
				return null;
			}
		}
		
		return link;
	}
	
	private String getAttachmentLink(String wikiHref)
	{
		String attachmentHref = (String)attachmentLinks.get(wikiHref);
		if(attachmentHref==null)
		{
			return null;
		}
		if(attachmentHref.charAt(0)!='/')
		{
			return "/"+attachmentHref;
		}
		return attachmentHref;
	}	
}
