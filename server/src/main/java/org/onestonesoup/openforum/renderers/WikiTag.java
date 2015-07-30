package org.onestonesoup.openforum.renderers;

public class WikiTag {
	
	public String openTag;
	public String closeTag;
	
	private String startTag;
	private String endTag;
	public boolean isEmptyTag; // used for hr and br tags
	//public boolean useWikiLinkRenderer;
	public boolean isRawTag;
	public boolean isSectionMarker;
	public WikiTag renderTag;
	public WikiTagRenderer renderer;
	
	public WikiTag(String startTag,String endTag)
	{
		this.startTag=startTag;
		this.endTag=endTag;
	}
	
	private static final WikiTag htmlBox = new WikiTag("<table class=\"box\"><tr><td>","</td></tr></table>");
	public static final WikiTag box = new WikiTag("%%box","%%");
	static{
		box.renderTag = htmlBox;
	}

	private static final WikiTag htmlNop = new WikiTag("","");
	public static final WikiTag nop = new WikiTag("%%","%%");
	static{
		nop.renderTag = htmlNop;
	}
	
	private static final WikiTag htmlH1 = new WikiTag("<h1>","</h1>");
	public static final WikiTag h1 = new WikiTag("!!!!","\r\n");
	static{
		h1.renderTag = htmlH1;
	}

	private static final WikiTag htmlH2 = new WikiTag("<h2>","</h2>");
	public static final WikiTag h2 = new WikiTag("!!!","\r\n");
	static{
		h2.renderTag = htmlH2;
	}
	
	private static final WikiTag htmlH3 = new WikiTag("<h3>","</h3>");
	public static final WikiTag h3 = new WikiTag("!!","\r\n");
	static{
		h3.renderTag = htmlH3;
	}
	
	private static final WikiTag htmlBold = new WikiTag("<b>","</b>");
	public static final WikiTag bold = new WikiTag("__","__");
	static{
		bold.renderTag = htmlBold;
	}
	
	private static final WikiTag htmlStrike = new WikiTag("<strike>","</strike>");
	public static final WikiTag strike = new WikiTag("~~","~~");
	static{
		strike.renderTag = htmlStrike;
	}
	
	private static final WikiTag htmlCenter = new WikiTag("<center>","</center>");
	public static final WikiTag center = new WikiTag(">>","<<");
	static{
		center.renderTag = htmlCenter;
	}	
	
	private static final WikiTag htmlSuper = new WikiTag("<sup>","</sup>");
	public static final WikiTag superTag = new WikiTag("^^","^^");
	static{
		superTag.renderTag = htmlSuper;
	}

	private static final WikiTag htmlPara = new WikiTag("<p>","</p>");
	public static final WikiTag para = new WikiTag("((","))");
	static{
		para.renderTag = htmlPara;
	}
	
	private static final WikiTag htmlCode = new WikiTag("<xmp class=\"example\">","</xmp>");
	public static final WikiTag code = new WikiTag("{{{","}}}");
	static{
		code.renderTag = htmlCode;
		code.isRawTag=true;
	}
	
	private static final WikiTag htmlItalics = new WikiTag("<i>","</i>");
	public static final WikiTag italics = new WikiTag("''","''");
	static{
		italics.renderTag = htmlItalics;
	}
	
	private static final WikiTag htmlLineBreak = new WikiTag("<br/>","");
	public static final WikiTag lineBreak = new WikiTag("\\\\","");
	static{
		lineBreak.renderTag = htmlLineBreak;
		lineBreak.isEmptyTag=true;
	}	

	private static final WikiTag htmlLineBreak2 = new WikiTag("<br/>","");
	public static final WikiTag lineBreak2 = new WikiTag("\r\n\r\n","");
	static{
		lineBreak2.renderTag = htmlLineBreak2;
		lineBreak2.isEmptyTag=true;
	}
	
	private static final WikiTag htmlRule = new WikiTag("<hr/>","");
	public static final WikiTag rule = new WikiTag("----","");
	static{
		rule.isSectionMarker = true;
		rule.renderTag = htmlRule;
		rule.isEmptyTag=true;
	}	
	
	private static final WikiTag htmlSquareBracketStart = new WikiTag("[","");
	public static final WikiTag squareBracketStart = new WikiTag("&sqs;","");
	static{
		squareBracketStart.isSectionMarker = true;
		squareBracketStart.renderTag = htmlSquareBracketStart;
		squareBracketStart.isEmptyTag=true;
	}	
	
	private static final WikiTag htmlSquareBracketEnd = new WikiTag("]","");
	public static final WikiTag squareBracketEnd = new WikiTag("&sqe;","");
	static{
		squareBracketEnd.isSectionMarker = true;
		squareBracketEnd.renderTag = htmlSquareBracketEnd;
		squareBracketEnd.isEmptyTag=true;
	}	
	
	public static final WikiTag link = new WikiTag("[","]");
	static{
		link.isRawTag = true;
		link.renderer = new WikiLinkRenderer();
	}	
	
	public static final WikiTag bullet1 = new WikiTag("*","\n");
	static{
		bullet1.isRawTag = true;
		bullet1.renderer = new WikiBulletRenderer("ul");
		bullet1.openTag="<ul>";
		bullet1.closeTag="</ul>";
	}
	
	public static final WikiTag list = new WikiTag("#","\n");
	static{
		list.isRawTag = true;
		list.renderer = new WikiBulletRenderer("ol");
		list.openTag="<ol>";
		list.closeTag="</ol>";
	}	

	public static final WikiTag table = new WikiTag("|","\n");
	static{
		table.isRawTag = true;
		table.renderer = new WikiTableRenderer();
		table.openTag="<table class=\"wikiTable\">";
		table.closeTag="</table>\n";
	}
	 
	public static final WikiTag time = new WikiTag("[{CurrentTimePlugin","}]");
	static{
		time.isRawTag = true;
		time.renderer = new WikiTimeRenderer();
	}
	
	public static final WikiTag insert = new WikiTag("[{InsertPage","}]");
	static{
		insert.isRawTag = true;
		insert.renderer = new WikiPageInsertRenderer();
	}
	
	public static final WikiTag image = new WikiTag("[{Image","}]");
	static{
		image.isRawTag=true;
		image.renderer=new WikiImageRenderer();
	}	
	
	public static final WikiTag extension = new WikiTag("[{","}]");
	static{
		extension.renderer = new WikiExtensionRenderer();
		extension.isRawTag = true;
	}	
	
	public static final WikiTag[] TAGS = new WikiTag[]{
		h1,
		h2,
		h3,
		box,
		nop,
		table,
		italics,
		bold,
		strike,
		center,
		superTag,
		para,
		code,
		lineBreak,
		rule,
		image,
		bullet1,
		list,
		time,
		insert,
		extension,
		lineBreak2,
		squareBracketStart,
		squareBracketEnd,
		link
	};

	public String getEndTag() {
		return endTag;
	}

	public String getStartTag() {
		return startTag;
	}

	public WikiTag getRenderTag() {
		return renderTag;
	}	
}
