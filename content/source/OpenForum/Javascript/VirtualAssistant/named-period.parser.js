/*
* Author: 
* Description: 
*/

var NamedPeriodParser = new function() {

  const DayOfWeek = {
    SUNDAY: 0,
    MONDAY: 1,
    TUESDAY: 2,
    WEDNESADY: 3,
    THURSDAY: 4,
    FRIDAY: 5,
    SATURDAY: 6
  };

  const WEEKEND = "at the weekend";
  const WEEKEND_2 = "over the weekend";
  const WEEKEND_3 = "on the weekend";
  const THIS_WEEK = "this week";
  const NEXT_WEEK = "next week";
  const TOMORROW = "tomorrow";
  const TODAY = "today";
  const NEXT_MONTH = "next month";
  const THIS_MONTH = "this month";
  const MONDAY = "on monday";
  const TUESDAY = "on tuesday";
  const WEDNESDAY = "on wednesday";
  const THURSDAY = "on thursday";
  const FRIDAY = "on friday";
  const SATURDAY = "on saturday";
  const SUNDAY = "on sunday";

  var self = this;

  var getDayOfYear = function(d) {
    var d2 = new Date(d.getTime());
    d2.setMonth(0, 0);
    return Math.round((d.getTime()-d2.getTime())/8.64e7);
  };

  var endOfTomorrow = function() {
    var date = new Date();
    date.setDate(date.getDate()+1);
    date.setHours(23);
    return date;
  };
  
  var startOfTomorrow = function() {
    var date = new Date();
    date.setDate(date.getDate()+1);
    date.setHours(0);
    return date;
  };
  
  var addDay = function(date) {
    date.setDate(date.getDate()+1);
    return date;
  };
  
  var endOfMonth = function(date) {
    if(!date) date = new Date();
    var month = date.getMonth();
    while(month==date.getMonth()) {
      date = addDay(date);
    }
    date.setDate(date.getDate()-1);
    return date;
  };
  
  self.getNamedPeriod = function(text) {
    var start;
    var end;
    var timeperiod = {
      text: text.toLowerCase(),
      found: "",
      left: text.toLowerCase(),
      equals: function(data) {
      	return timeperiod.text==data;
      },
      endsWith: function(data) {
        if(timeperiod.text.length<data.length) return false;
        var state = timeperiod.text.indexOf(data) == timeperiod.text.length-data.length;
        if(state) {
          timeperiod.found = data;
          timeperiod.left = timeperiod.text.substring(0,timeperiod.text.length-data.length).trim();
        }
        return state;
      }
    };
    if(timeperiod.endsWith(WEEKEND) || timeperiod.endsWith(WEEKEND_2) || timeperiod.endsWith(WEEKEND_3)) {
      
      end = new Date();
      while(end.getDay()!= DayOfWeek.SUNDAY) {
        end = addDay(end);
      }

      start = new Date();
      while(getDayOfYear(start) < getDayOfYear(end) && start.getDay()!=DayOfWeek.FRIDAY) {
        start = addDay(start);
      }
    } else if(timeperiod.equals(THIS_WEEK)) {
      start = new Date();
      start.setHours(0);

      end = new Date();
      while(getDayOfYear(end)<getDayOfYear(start) && end.getDay()!=DayOfWeek.SUNDAY) {
        end = addDay(end);
      }
    } else if(timeperiod.endsWith(NEXT_WEEK)) {
      start = new Date();
      while(start.getDay()!=DayOfWeek.MONDAY) {
        start = addDay(start);
      }

      end = new Date(start.getTime());
      while(getDayOfYear(end)<getDayOfYear(start) && end.getDay()!=DayOfWeek.SUNDAY) {
        end = addDay(end);
      }
    } else if(timeperiod.endsWith(TOMORROW)) {
      start = startOfTomorrow();
      end = endOfTomorrow();
    } else if(timeperiod.equals(TODAY)) {
      start = new Date();
      end = new Date();
      end.setHours(23);

    } else if(timeperiod.endsWith(MONDAY)) {
      start = startOfTomorrow();
      while(start.getDay()!=DayOfWeek.MONDAY) {
        start = addDay(start);
      }
      end = new Date(start.getTime());
      end.setHours(23);
    } else if(timeperiod.endsWith(TUESDAY)) {
      start = startOfTomorrow();
      while(start.getDay()!=DayOfWeek.TUESDAY) {
        start = addDay(start);
      }
      end = new Date(start.getTime());
      end.setHours(23);
    } else if(timeperiod.endsWith(WEDNESDAY)) {
      start = startOfTomorrow();
      while(start.getDay()!=DayOfWeek.WEDNESDAY) {
        start = addDay(start);
      }
      end = new Date(start.getTime());
      end.setHours(23);
    } else if(timeperiod.endsWith(THURSDAY)) {
      start = startOfTomorrow;
      while(start.getDay()!=DayOfWeek.THURSDAY) {
        start = addDay(start);
      }
      end = new Date(start);
      end.setHours(23);
    } else if(timeperiod.endsWith(FRIDAY)) {
      start = startOfTomorrow();
      while(start.getDay()!=DayOfWeek.FRIDAY) {
        start = addDay(start);
      }
      end = new Date(start.getTime());
      end.setHours(23);
    } else if(timeperiod.endsWith(SATURDAY)) {
      start = startOfTomorrow();
      while(start.getDay()!=DayOfWeek.SATURDAY) {
        start = addDay(start);
      }
      end = new Date(start.getTime());
      end.setHours(23);
    } else if(timeperiod.endsWith(SUNDAY)) {
      start = startOfTomorrow();
      while(start.getDay()!=DayOfWeek.SUNDAY) {
        start = addDay(start);
      }
      end = new Date(start.getTime());
      end.setHours(23);
    } else if(timeperiod.endsWith(THIS_MONTH)) {
      start = new Date();
      end = endOfMonth();

    } else if(timeperiod.endsWith(NEXT_MONTH)) {
      start = new Date();
      start.setMonth(start.getMonth()+1);
      start.setDate(1);
      
      end = new Date(start.getTime());
      endOfMonth(end);

    } else {
      timeperiod.found = TODAY;
      start = new Date();
      end = new Date();
      end.setHours(23);
    }

    return {original: timeperiod.text, timeperiod: timeperiod.found, left: timeperiod.left,start: start,end: end};
  };
  
  self.getVoicedDate = function(date) {
    var say = "";
    say += date.getDate() + "/" + (date.getMonth()+1) + "/" +date.getFullYear();
  };
};
