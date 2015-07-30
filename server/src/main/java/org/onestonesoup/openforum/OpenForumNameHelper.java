package org.onestonesoup.openforum;

import java.util.StringTokenizer;

public class OpenForumNameHelper {

	public static String wikiNameToTitle(String wikiName)
	{
		StringBuffer buffer = new StringBuffer();
		StringBuffer word = new StringBuffer();

		for(int loop=0;loop<wikiName.length();loop++)
		{
			/*if( loop!=0 && Character.isUpperCase( wikiName.charAt(loop) ) )
			{
				buffer.append( word.toString() );
				buffer.append( ' ' );
				word = new StringBuffer();
			}*/

			if(word.length()==0)
			{
				word.append( Character.toUpperCase( wikiName.charAt(loop) ) );
			}
			else
			{
				if( Character.isUpperCase(wikiName.charAt(loop)) )
				{
					buffer.append(word);
					if(word.length()>1)
					{
						buffer.append(' ');
					}
					word = new StringBuffer();
					word.append( wikiName.charAt(loop) );					
				}
				else
				{
					word.append( wikiName.charAt(loop) );
				}
			}
		}

		buffer.append( word.toString() );

		String newName = buffer.toString();
		if(newName.indexOf('/')!=-1)
		{
			String[] parts = newName.split("/");
			newName = parts[parts.length-1];
		}
		
		return newName;
	}
	
	public static String titleToWikiName(String title)
	{
		title = removeNonAlphas(title);

		//title = title.toLowerCase();

		StringTokenizer tokenizer = new StringTokenizer( title," " );

		StringBuffer buffer = new StringBuffer();

		while( tokenizer.hasMoreTokens() )
		{
			String word = tokenizer.nextToken();
			String wordCaps = word.toUpperCase();
			buffer.append(wordCaps.charAt(0));
			buffer.append(word.substring(1));
		}

		title = buffer.toString();
		
		if(title.indexOf("..")!=-1)
		{
			String[] parts = title.split("/");
			title="";
			for(int loop=0;loop<parts.length;loop++)
			{
				if(parts.length>loop+1 && parts[loop+1].equals(".."))
				{
					loop+=2;
					if(loop>=parts.length)
					{
						break;
					}
				}
				if(loop>0)
				{
					title+="/";
				}
				title+=parts[loop];
			}
		}
		
		return title;
	}
	
	private static String removeNonAlphas(String data) {

		StringBuffer buffer = new StringBuffer();

		for(int loop=0;loop<data.length();loop++)
		{
			if( Character.isLetterOrDigit( data.charAt(loop) ) )
			{
				buffer.append(data.charAt(loop));
			}
			else if( data.charAt(loop)=='_' )
			{
				buffer.append(data.charAt(loop));
			}
			else if( data.charAt(loop)=='-' )
			{
				buffer.append(data.charAt(loop));
			}
			else if( data.charAt(loop)=='.' )
			{
				buffer.append(data.charAt(loop));
			}
			else if( data.charAt(loop)=='\'' )
			{
				buffer.append(data.charAt(loop));
			}
			else if( data.charAt(loop)=='/' )
			{
				buffer.append(data.substring(loop,data.length()));
				break;
			}
			else
			{
				buffer.append( ' ' );
			}
		}

		return buffer.toString();
	}
	
	public static String validateWikiTitle(String title)
	{	
		if(title.indexOf("<")!=-1)
		{
			return "can not contain <";
		}
		else if(title.indexOf(">")!=-1)
		{
			return "can not contain >";
		}
		else if(title.indexOf("%")!=-1)
		{
			return "can not contain%";
		}
		else if(title.indexOf("[")!=-1)
		{
			return "can not contain [";
		}
		else if(title.indexOf("]")!=-1)
		{
			return "can not contain ]";
		}
		else if(title.indexOf("|")!=-1)
		{
			return "can not contain |";
		}
		else if(title.indexOf(":")!=-1)
		{
			return "can not contain :";
		}
		else if(title.indexOf("?")!=-1)
		{
			return "can not contain ?";
		}
		else if(title.indexOf("%")!=-1)
		{
			return "can not contain %";
		}
		else if(title.indexOf("|")!=-1)
		{
			return "can not contain |";
		}
		else if(title.indexOf("*")!=-1)
		{
			return "can not contain *";
		}
		else if(title.indexOf("\"")!=-1)
		{
			return "can not contain \"";
		}
		else if(title.indexOf("history")!=-1)
		{
			return "can not be called history";
		}
		
		return "OK";
	}
}
