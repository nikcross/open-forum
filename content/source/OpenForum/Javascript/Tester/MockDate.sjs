/*
* Author: 
* Description:
* 
* var mockDate = js.getObject("/OpenForum/Javascript/Tester","MockDate.sjs").getMock(1000);
*/
var MockDate = function() {
  var nowMs = 0;

  this.setMockTime = function(ts) { nowMs = ts };

  this.getMock = function(ts) {
    if(ts) { nowMs = ts; }

    return function() {
      var date = new Date(nowMs);

      this.getDate = function() { return date.getDate(); }

      this.getDay = function() { return date.getDay(); }

      this.getFullYear = function() { return date.getFullYear(); }

      this.getHours = function() { return date.getHours(); }

      this.getMilliseconds = function() { return date.getMilliseconds(); }

      this.getMinutes = function() { return date.getMinutes(); }

      this.getMonth = function() { return date.getMonth(); }

      this.getSeconds = function() { return date.getSeconds(); }

      this.getTime = function() { return date.getTime(); }

      this.getTimezoneOffset = function() { return date.getTimezoneOffset(); }

      this.parse = function() { return date.parse(); }

      this.setDate = function(dom) { return date.setDate(dom); }

      this.setFullYear = function(year) { return date.setFullYear(year); }

      this.setHours = function(hours) { return date.setHours(hours); }

      this.setMilliseconds = function(ms) { return date.setMilliseconds(ms); }

      this.setMinutes = function(minutes) { return date.setMinutes(minutes); }

      this.setMonth = function(month) { return date.setMonth(month); }

      this.setSeconds = function(seconds) { return date.setSeconds(seconds); }

      this.setTime = function(time) { return date.setTime(time); }

      this.toDateString = function() { return date.toDateString(); }

      this.getDisplayString = function() { return date.getDisplayString(); };

      this.SECOND_IN_MILLIS=date.SECOND_IN_MILLIS;

      this.MINUTE_IN_MILLIS=date.MINUTE_IN_MILLIS;

      this.HOUR_IN_MILLIS=date.HOUR_IN_MILLIS;

      this.DAY_IN_MILLIS=date.DAY_IN_MILLIS;

      this.plusSeconds= function(seconds) { return date.plusSeconds(seconds); };

      this.plusMinutes= function(minutes) { return date.plusMinutes(minutes); };

      this.plusHours= function(hours) { return date.plusHours(hours); };

      this.plusDays= function(days) { return date.plusDays(days); };

      this.plusMonths= function(months) { return date.plusMonths(months); };

      this.plusYears= function(years) { return date.plusYears(years); };

      this.isAfter= function(d) { return date.isAfter(d); };

      this.isBefore= function(d) { return date.isBefore(d); };

      this.toString = function() { return ""+date; };
    };
  };
}