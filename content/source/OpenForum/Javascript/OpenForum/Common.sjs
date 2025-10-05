/*
* Author: 
* Description: 
* Example Usage:
  if(typeof Common === "undefined") {
    var Common = js.getObject("/OpenForum/Javascript","Common.sjs");
    Common.extendArray(Array);
    Common.extendDate(Date);
    Common.extendString(String);
  }
*/
var Common = function() {
  this.extendArray = function(a) {
    a.includes = function(list,thing) {
      for(var i in list) {
        if(typeof(thing) === "function") {
          if(thing(list[i]) === true) return true;
        } else if(list[i] === thing) {
          return true;
        }
      }
      return false;
    };
  };
  this.extendDate = function(d) { 
    d.prototype.getDisplayString = function() {
      return (""+this).substring(0,24);
    };

    d.prototype.SECOND_IN_MILLIS = 1000;
    d.prototype.MINUTE_IN_MILLIS = d.prototype.SECOND_IN_MILLIS*60;
    d.prototype.HOUR_IN_MILLIS = d.prototype.MINUTE_IN_MILLIS*60;
    d.prototype.DAY_IN_MILLIS = d.prototype.HOUR_IN_MILLIS*24;

    d.prototype.plusSeconds = function(seconds) {
      this.setTime( this.getTime()+(this.SECOND_IN_MILLIS*seconds) );
      return this;
    };
    d.prototype.plusMinutes = function(minutes) {
      this.setTime( this.getTime()+(this.HOUR_IN_MILLIS*minutes) );
      return this;
    };
    d.prototype.plusHours = function(hours) {
      this.setTime( this.getTime()+(this.HOUR_IN_MILLIS*hours) );
      return this;
    };
    d.prototype.plusDays = function(days) {
      this.setTime( this.getTime()+(this.DAY_IN_MILLIS*days) );
      return this;
    };

    d.prototype.plusMonths = function(months) {
      this.setMonth( this.getMonth()+months );
      return this;
    };

    d.prototype.plusYears = function(years) {
      this.setYear( this.getYears()+years );
      return this;
    };

    d.prototype.isAfter = function(date) {
      return (this.getTime()>date.getTime());
    };

    d.prototype.isBefore = function(date) {
      return (this.getTime()<date.getTime());
    };

    d.prototype.parseDDMMYYYY = function(dateString) {
      if(dateString.length!==10) return;
      try{
        var year = parseInt( dateString.substring(6,10) ,10 );
        var month = parseInt( dateString.substring(3,5),10 );

        var day = parseInt( dateString.substring(0,2),10 );
        var date = new d( year, month-1, day );
        return date;
      } catch(e) {
        return;
      }
    };

    d.prototype.setHHMM = function(time) {
      if(time.length!=5) return;
      try{
        this.setHours( parseFloat(time.substring(0,2)) );
        this.setMinutes( parseFloat(time.substring(3,5)) );
        this.setSeconds( 0 );
        this.setMilliseconds(0);
      } catch(e) {
        return;
      }
      return this;
    };
  };
  this.extendString = function(s) {
    s.prototype.startsWith = function(start) {
      return (this.indexOf(start)===0);
    };
    
    s.prototype.endsWith = function(end) {
      return (this.indexOf(end)!==-1 && this.indexOf(end)===this.length-end.length);
    };

    s.prototype.contains = function(text) {
      return (this.indexOf(text)===-1)===false;
    };

    s.prototype.between = function(start,end) {
      if(this.contains(start) === false || this.contains(end) === false) return;
      var result = this.substring(this.indexOf(start)+start.length);
      return result.substring(0,result.indexOf(end));
    };

    s.prototype.before = function (end) {
      if(this.contains(end) === false) return;
      return this.substring(0,this.indexOf(end));
    };

    s.prototype.after = function (start) {
      if(this.contains(start) === false) return;
      return this.substring(this.indexOf(start)+start.length);
    };

    s.prototype.replaceAll = function(find,replace) {
      return this.replace( new RegExp(find,"g"), replace);
    };

    s.prototype.padBefore = function(padding,targetLength) {
      var result = this;
      while(this.length<targetLength) {
        result = padding+result;
      }
      return result;
    };

    s.prototype.padAfter = function(padding) {
      var result = this;
      while(result.length<targetLength) {
        result = result+padding;
      }
      return result;
    };

    s.prototype.trim = function() {
      var result = this;
      result = result.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
      return result;
    };
  };
};
