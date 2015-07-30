package org.onestonesoup.openforum.renderers;

public class WikiLink {
	public String displayName;
	public String href;
	public String anchor;
	public String parameters;
	public boolean external;
	
	public WikiLink(String displayName,String href,String anchor,String parameters,boolean external)
	{
		this.displayName = displayName;
		this.href = href;
		this.anchor = anchor;
		this.parameters = parameters;
		this.external = external;
	}
}
