package org.onestonesoup.openforum;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.onestonesoup.core.data.KeyValuePair;

public class DataHelper {

	public static Map<String,String> getWikiTableAsTable(String source)	{
		source = source.replace('\\','\n');
		String[] fields = source.split("\n");
		Map<String,String> fieldsTable = new HashMap<String,String>();
		for(int loop=0;loop<fields.length;loop++)
		{
			fields[loop] = fields[loop].trim();
			if(fields[loop].length()==0 || fields[loop].charAt(0)!='|')
			{
				continue;
			}
			
			fields[loop]=fields[loop].substring(1);
			       
			KeyValuePair value = KeyValuePair.parseKeyAndValue(fields[loop],"\\|");
			fieldsTable.put( value.getKey().trim(),value.getValue().trim() );
		}
		
		return fieldsTable;
	}
	
	public static Map<String,String> getPageAsTable(String source) {
		if(source==null) {
			return new HashMap<String,String>();
		}
		source = source.replace('\\','\n');
		String[] fields = source.split("\n");
		Map<String,String> fieldsTable = new HashMap<String,String>();
		for(int loop=0;loop<fields.length;loop++)
		{
			fields[loop] = fields[loop].trim();
			if(fields[loop].startsWith("*")) {
				fields[loop] = fields[loop].substring(1).trim();
			}
			if(fields[loop].indexOf('=')==-1)
			{
				continue;
			}
			KeyValuePair value = KeyValuePair.parseKeyAndValue(fields[loop],"=");
			fieldsTable.put( value.getKey().trim(),value.getValue().trim() );
		}
		
		return fieldsTable;
	}
	
	public static ArrayList<KeyValuePair> getPageAsKeyValuePairList(String source) {
		source = source.replace('\\','\n');
		String[] fields = source.split("\n");
		ArrayList<KeyValuePair> fieldsTable = new ArrayList<KeyValuePair>();
		for(int loop=0;loop<fields.length;loop++)
		{
			fields[loop] = fields[loop].trim();
			if(fields[loop].indexOf('=')==-1)
			{
				continue;
			}
			KeyValuePair value = KeyValuePair.parseKeyAndValue(fields[loop],"=");
			fieldsTable.add( new KeyValuePair(value.getKey().trim(),value.getValue().trim()) );
		}
		
		return fieldsTable;
	}	
	
	public static String[][] getPageAsList(String source) {
		source = source.replace('\\','\n');
		String[] fields = source.split("\n");
		List<String> keyList = new ArrayList<String>();
		List<String> valueList = new ArrayList<String>();
		for(int loop=0;loop<fields.length;loop++)
		{
			fields[loop] = fields[loop].trim();
			if(fields[loop].indexOf('*')!=0)
			{
				continue;
			}
			if(fields[loop].indexOf('[')==-1)
			{
				keyList.add( fields[loop].substring(1).trim() );
				valueList.add( fields[loop].substring(1).trim() );
				continue;
			}
			fields[loop] = fields[loop].substring(fields[loop].indexOf('[')+1,fields[loop].indexOf(']'));
			if(fields[loop].indexOf('|')==-1)
			{
				keyList.add( fields[loop].substring(1).trim() );
				valueList.add( fields[loop].substring(1).trim() );
				continue;
			}			
			
			KeyValuePair value = KeyValuePair.parseKeyAndValue(fields[loop],"\\|");
			keyList.add( value.getKey().trim() );
			valueList.add( value.getValue().trim() );
		}
		
		String[][] list = new String[keyList.size()][2];
		for(int loop=0;loop<keyList.size();loop++)
		{
			list[loop][0] = (String)keyList.get(loop);
			list[loop][1] = (String)valueList.get(loop);
		}
		
		return list;
	}
	
	public static String prepareTextForEditing(String data)	{

		return data.replace("&","&amp;").replace("<","&lt;").replace(">","&gt;");
	}
	
	public static String getFileSizeDisplayString(long size) {
		String displayString = ""+size;
		
		if(displayString.length()<4)
		{
			return displayString+" Bytes";
		}
		
		String suffix = null;
		
		if(size>1000000000)
		{
			suffix = "."+(size%1000000000/10000000)+" GB";
			size = size/1000000000;
		}
		else if(size>1000000)
		{
			suffix = "."+(size%1000000/10000)+" MB";
			size = size/1000000;
		}
		else
		{
			suffix = "."+(size%1000/100)+" KB";
			size = size/1000;
		}
		displayString = ""+size;
		
		String newDisplayString = "";
		
		if(displayString.length()<4)
		{
			newDisplayString = displayString;
		}
		else
		{
			int loop = 0;
			for(loop=displayString.length();loop>=3;loop-=3)
			{
				if(newDisplayString.length()>0)
				{
					newDisplayString = displayString.substring(loop-3,loop)+","+newDisplayString;
				}
				else
				{
					newDisplayString = displayString.substring(loop-3,loop);
				}
			}
			if(loop!=0)
			{
				newDisplayString = displayString.substring(0,loop)+","+newDisplayString;
			}
		}
		
		return newDisplayString+suffix;
	}
}
