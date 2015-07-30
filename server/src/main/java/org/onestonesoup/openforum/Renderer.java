package org.onestonesoup.openforum;

import java.util.ArrayList;
import java.util.List;
import java.util.Stack;

import org.onestonesoup.openforum.controller.OpenForumController;
import org.onestonesoup.openforum.renderers.WikiLinkParser;
import org.onestonesoup.openforum.renderers.WikiTag;


public class Renderer {

	public static boolean wikiToHtml(String pageName,String data,StringBuffer target,OpenForumController controller,WikiLinkParser linkRenderer)
	{
		return wikiToHtml(pageName,data,target,controller,linkRenderer,new ArrayList<String>());
	}
	
	public static boolean wikiToHtml(String pageName,String data,StringBuffer target,OpenForumController controller,WikiLinkParser linkRenderer,List<String> sections)
	{
		if(data==null)
		{
			return true;
		}
		
		Stack<WikiTag> tagStack = new Stack<WikiTag>();
		WikiTag currentTag=null;
		boolean currentTagRendered = false;
		int counter = 0;
		int lastSectionCursor = target.length();
		
		StringBuffer tagData = new StringBuffer();
		
		int cursor = 0;
		boolean rawMode = false;
		while(cursor<data.length())
		{
			int left = data.length()-cursor;
			
			if( tagStack.empty()==false )
			{
				WikiTag top = (WikiTag)tagStack.peek();
				if( left>=top.getEndTag().length() && data.substring(cursor,cursor+top.getEndTag().length()).equals(top.getEndTag()) )
				{
					if(top.renderer!=null)
					{
						top.renderer.render(pageName,target,tagData,counter,controller,linkRenderer);
						counter++;
					}
					else
					{
						if(top.isSectionMarker && !pageName.equals("LeftMenu"))
						{
							target.insert(lastSectionCursor,"<a name=\"section"+(sections.size()+1)+"\">");							
						}
						target.append(tagData);
						target.append(top.getRenderTag().getEndTag());
						counter = 0;
					}
					
					if(top.isSectionMarker)
					{
						sections.add( target.substring(lastSectionCursor,target.length()) );
						lastSectionCursor = target.length();
					}
					cursor+=top.getEndTag().length();
					
					currentTagRendered = true;
					tagData = new StringBuffer();
					tagStack.pop();
					rawMode=false;
					
					continue;
				}
			}
			
			if(rawMode==false)
			{
				boolean found = false;
				for(int loop=0;loop<WikiTag.TAGS.length;loop++)
				{
					if(data.substring(cursor).startsWith(WikiTag.TAGS[loop].getStartTag()))
					{						
						target.append(tagData);
						tagData = new StringBuffer();
						
						if( WikiTag.TAGS[loop].isEmptyTag )
						{
							target.append(WikiTag.TAGS[loop].getRenderTag().getStartTag());
							counter = 0;
							
							if(WikiTag.TAGS[loop].isSectionMarker)
							{
								if(!pageName.equals("LeftMenu"))
								{
									target.insert(lastSectionCursor,"<a name=\"section"+(sections.size()+1)+"\"></a>");
								}

								sections.add( target.substring(lastSectionCursor,target.length()-WikiTag.TAGS[loop].getRenderTag().getStartTag().length()) );
								lastSectionCursor = target.length();
							}							
						}
						else
						{
							rawMode = WikiTag.TAGS[loop].isRawTag;
							
							if(currentTag==null || currentTag!=WikiTag.TAGS[loop] )
							{
								if(currentTag!=null && currentTag.closeTag!=null)
								{
									target.append(currentTag.closeTag);
								}
								if(WikiTag.TAGS[loop].openTag!=null)
								{
									target.append(WikiTag.TAGS[loop].openTag);
								}
							}							
							
							if(WikiTag.TAGS[loop].renderer==null)
							{
								target.append(WikiTag.TAGS[loop].getRenderTag().getStartTag());
								counter = 0;
							}
							
							tagStack.push(WikiTag.TAGS[loop]);
							currentTag = WikiTag.TAGS[loop];
							currentTagRendered = false;
						}
						cursor+=WikiTag.TAGS[loop].getStartTag().length();
						
						found = true;
						break;
					}
				}
				if(found)
				{
					continue;
				}
			}
			if(tagStack.empty())
			{
				if(currentTag!=null && currentTag.closeTag!=null)
				{
						target.append(currentTag.closeTag);
				}
				currentTag=null;
			}
			
			tagData.append(data.charAt(cursor));
			cursor++;
		}
		
		if(currentTag!=null && currentTag.closeTag!=null)
		{
			if(currentTagRendered==false)
			{
				if(currentTag.renderer!=null)
				{
					currentTag.renderer.render(pageName,target,tagData,counter,controller,linkRenderer);
					counter++;
					target.append(currentTag.closeTag);
				}
				else
				{
					target.append(currentTag.closeTag);
					target.append( tagData );				
				}
			}
			else
			{
				target.append(currentTag.closeTag);
				target.append( tagData );	
			}
		}
		else
		{
			target.append( tagData );
		}		
		
		if( tagStack.isEmpty()==false )
		{
			while( tagStack.isEmpty()==false )
			{
				WikiTag top = (WikiTag)tagStack.pop();
				if(top.getRenderTag()!=null)
				{
					target.append(top.getRenderTag().getEndTag());
				}
			}
			
			sections.add( target.substring(lastSectionCursor,target.length()) );
			return false;
		}
		sections.add( target.substring(lastSectionCursor,target.length()) );
		return true;
	}
	
}
