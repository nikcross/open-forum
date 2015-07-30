package org.onestonesoup.openforum.trigger;

import java.util.Date;
import java.util.Timer;
import java.util.TimerTask;

import org.onestonesoup.core.constants.TimeConstants;
import org.onestonesoup.openforum.controller.OpenForumController;

public class TimerTrigger extends Trigger{

	private long previousTimeStamp = 0;
	private long currentTimeStamp = 0;
	
	private TimeTrigger task;
	
	public TimerTrigger(OpenForumController builder) {
		super(builder);
		
		task = new TimeTrigger();
		Timer timer = new Timer(true);
		timer.schedule( task,TimeConstants.SECOND*10,TimeConstants.SECOND*10 );
	}

	public String getPageName() {
		return "/OpenForum/Triggers/TimerTrigger";
	}

	public long getCurrentTime()
	{
		return currentTimeStamp;
	}
	
	public long getPreviousTime()
	{
		return previousTimeStamp;
	}
	
	public boolean isMinutePeriod()
	{
		if(
				(currentTimeStamp/10000)%(TimeConstants.MINUTE/10000)==0
		)
		{
			return true;
		}
		else
		{
			return false;
		}
	}	
	
	public boolean isTenMinutePeriod()
	{
		if(
				(currentTimeStamp/10000)%(TimeConstants.MINUTE/1000)==0
		)
		{
			return true;
		}
		else
		{
			return false;
		}
	}
	
	public boolean isHourPeriod()
	{
		if(
				(currentTimeStamp/10000)%(TimeConstants.HOUR/10000)==0
		)
		{
			return true;
		}
		else
		{
			return false;
		}
	}
	
	public boolean isNewDay()
	{
		if(new Date(currentTimeStamp).getDate()!=new Date(previousTimeStamp).getDate())
		{
			return true;
		}
		else
		{
			return false;
		}
	}	
	
	public boolean isNewYear()
	{
		if(new Date(currentTimeStamp).getYear()!=new Date(previousTimeStamp).getYear())
		{
			return true;
		}
		else
		{
			return false;
		}
	}
	
	public int getSeconds()
	{
		return new Date(currentTimeStamp).getSeconds();
	}
	
	public int getMinutes()
	{
		return new Date(currentTimeStamp).getMinutes();
	}	
	
	public int getHours()
	{
		return new Date(currentTimeStamp).getHours();
	}
	
	class TimeTrigger extends TimerTask
	{
		public void run()
		{
			previousTimeStamp = currentTimeStamp;
			currentTimeStamp = System.currentTimeMillis();
			triggerListeners( ""+currentTimeStamp/1000,"10 Seconds Elapsed" );
		}
	}

	public int getDay()
	{
		return new Date(currentTimeStamp).getDate();
	}	
	
	public int getDayOfWeek()
	{
		return new Date(currentTimeStamp).getDay();
	}
	
	public int getMonth()
	{
		return new Date(currentTimeStamp).getMonth()+1;
	}
	
	public int getYear()
	{
		return new Date(currentTimeStamp).getYear()+1900;
	}	
}
