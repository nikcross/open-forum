/*
* Author: 
* Description: 
*/

var pageName = "/TheLab/RemoteJavascript";

var TimeConstants = {
  MILLISECOND: 1,
  SECOND: 1000
};

TimeConstants.MINUTE = TimeConstants.SECOND*60;
TimeConstants.HOUR = TimeConstants.MINUTE*60;
TimeConstants.DAY = TimeConstants.HOUR*24;
TimeConstants.WEEK = TimeConstants.DAY*7;
TimeConstants.YEAR = TimeConstants.DAY*360;

var TimerTrigger = function(date,oldDate) {
  var self = this;
  var currentTimeStamp = date.getTime();

  self.getPageName = function() {
    return pageName;
  };

  self.getCurrentTime = function() { return currentTimeStamp; };
  self.getDay = function() { return date.getDate(); };
  self.getDayOfWeek = function() { return date.getDay(); };
  self.getHours = function() { return date.getHours(); };
  self.getMinutes = function() { return date.getMinutes(); };
  self.getMonth = function() { return date.getMonth(); };
  self.getPreviousTime = function() { return oldDate.getTime(); };
  self.getSeconds = function() { return date.getSeconds(); };
  self.getYear = function() { return date.getFullYear(); };
  self.isHourPeriod = function() { return ((currentTimeStamp/10000)%(TimeConstants.HOUR/10000)===0); };
  self.isMinutePeriod = function() { return ((currentTimeStamp/10000)%(TimeConstants.MINUTE/10000)===0); };
  self.isNewDay = function() { return (date.getDate()!==oldDate.getDate()); };
  self.isNewYear = function() { return (date.getFullYear()!==oldDate.getFullYear()); };
  self.isTenMinutePeriod = function() { return ((currentTimeStamp/10000)%(TimeConstants.MINUTE/1000)===0); };
};

// Format: YYYY-MM-DD HH:MM:SS
function getTimeStamp( data ) {
  var parts = data.split(" ");
  var dateParts = parts[0].split("-");
  var timeParts = parts[1].split(":");
  
  var date = new Date( parseInt(dateParts[0],10),parseInt(dateParts[1],10)-1,parseInt(dateParts[2],10),parseInt(timeParts[0],10),parseInt(timeParts[1],10),parseInt(timeParts[2],10) );
  return date;
}

var now = getTimeStamp("2016-01-01 08:30:00");
var last = getTimeStamp("2016-01-01 08:29:50");
var trigger = new TimerTrigger(now,last);

var script = ""+file.getAttachment( pageName,"trigger.sjs" );

eval(script);

