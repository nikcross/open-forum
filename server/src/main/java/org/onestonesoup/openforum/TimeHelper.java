package org.onestonesoup.openforum;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;

import org.onestonesoup.core.constants.TimeConstants;

public class TimeHelper {
	
	public static String getCurrentDateTimeStamp()
	{
		return new SimpleDateFormat("dd-MM-yyyy_hh-mm-ss").format( new Date() );
	}
	
	public static String getDateTimeStamp(Date date)
	{
		return new SimpleDateFormat("dd-MM-yyyy_hh-mm-ss").format( date );
	}	
	
	public static String getCurrentDisplayTimestamp()
	{
		return getDisplayTimestamp(new Date());
	}
	
	public static String getDisplayTimestamp(Date date)
	{
		return "on "+new SimpleDateFormat("dd/MM/yyyy").format(date)+" at "+new SimpleDateFormat("hh:mm a").format(date);
	}	

	@SuppressWarnings("deprecation")
	public static String getDisplayTimespan(Date date)
	{
		Date now = new Date();
		long days = (now.getTime()-date.getTime())/TimeConstants.DAY;
		long hours = (now.getTime()-date.getTime())/TimeConstants.HOUR;
		
		if(days==0)
		{
			int testDays = now.getDate() - date.getDate();
			if(testDays==1)
			{
				days = 1;
			}
		}
		
		if(hours<10)
		{
			return hours+" hours ago at "+new SimpleDateFormat("hh:mm a").format(date);			
		}
		else if(days==0)
		{
			return "today at "+new SimpleDateFormat("hh:mm a").format(date);
		}
		else if(days==1)
		{
			return "yesterday at "+new SimpleDateFormat("hh:mm a").format(date);
		}
		else if(days<10)
		{
			return days+" days ago at "+new SimpleDateFormat("hh:mm a").format(date);			
		}
		else
		{
			return "on "+new SimpleDateFormat("dd/MM/yyyy").format(date)+" at "+new SimpleDateFormat("hh:mm a").format(date);
		}
	}
	
	public static Date getBlogEntryDate(String entryFileName) throws ParseException
	{
		try{
			return new SimpleDateFormat("dd-MM-yyyy_hh-mm-ss").parse(entryFileName);
		}
		catch(Exception e)
		{
			return null;
		}
	}	
}
