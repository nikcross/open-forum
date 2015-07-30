package org.onestonesoup.openforum.renderers;

public class WikiBulletTag extends WikiTag {

	public WikiBulletTag(String token)
	{
		super(token,"\r\n");
		
		renderTag = new WikiTag("<li>","</li>");
	}
	
	public WikiTag getRenderTag()
	{
		
		return renderTag;
	}
}
