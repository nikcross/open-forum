//Global extra methods

function typeOf( thing ) {
  return Object.prototype.toString.call( thing ).slice(8, -1).toLowerCase();
}

function isArray( thing ) {
  return typeOf( thing ) == "array";
}

function isObject( thing ) {
  return typeOf( thing ) == "object";
}

function isFunction( thing ) {
  return typeOf( thing ) == "function";
}

function isUndefined( thing ) {
  return typeOf( thing ) == "undefined";
}

function isString( thing ) {
  return typeOf( thing ) == "string";
}

function isNumber( thing ) {
  return typeOf( thing ) == "number";
}

function isFloat( thing ) {
    return thing === +thing && thing !== (thing|0);
}

function isInteger( thing ) {
    return thing === +thing && thing === (thing|0);
}

function isNullOrBlank( thing ) { 
  return (
  		isUndefined(thing) ||
    	thing == null ||
    	( isString( thing ) && thing.trim().length == 0)
    );
}

//---- Math extra methods ----

Math.degToRad = function( deg ) {
  return (deg * Math.PI)/180;
};

Math.radToDeg = function( rad ) {
  return (rad * 180)/Math.PI;
};

//---- String extra methods ----
String.prototype.contains = function(start) {
  return (this.indexOf(start)!==-1);
};

String.prototype.startsWith = function(start) {
  return (this.indexOf(start)===0);
};

String.prototype.endsWith = function(end) {
  if(!this.contains(end)) return false;
  return (this.lastIndexOf(end)===this.length-end.length);
};

String.prototype.between = function(start,end) {
  if(!this.contains(start) || !this.contains(end)) return;
  return this.substring(this.indexOf(start)+start.length,this.indexOf(end));
};

String.prototype.before = function (end) {
  if(!this.contains(end)) return;
  return this.substring(0,this.indexOf(end));
};

String.prototype.beforeLast = function (end) {
  if(!this.contains(end)) return;
  return this.substring(0,this.lastIndexOf(end));
};

String.prototype.after = function (start) {
  if(!this.contains(start)) return;
  return this.substring(this.indexOf(start)+start.length);
};

String.prototype.afterLast = function (start) {
  if(!this.contains(start)) return;
  return this.substring(this.lastIndexOf(start)+start.length);
};

String.prototype.replaceAll = function(find,replace) {
  return this.replace( new RegExp(find,"g"), replace);
};

String.prototype.padBefore = function(padding,targetLength) {
  var result = this;
  while(result.length<targetLength) {
    result = padding+result;
  }
  return result;
};

String.prototype.padAfter = function(padding) {
  var result = this;
  while(result.length<targetLength) {
    result = result+padding;
  }
  return result;
};

//---- Date extra methods
Date.prototype.getDisplayString = function() {
  return (""+this).substring(0,24);
};

Date.prototype.SECOND_IN_MILLIS = 1000;
Date.prototype.MINUTE_IN_MILLIS = Date.prototype.SECOND_IN_MILLIS*60;
Date.prototype.HOUR_IN_MILLIS = Date.prototype.MINUTE_IN_MILLIS*60;
Date.prototype.DAY_IN_MILLIS = Date.prototype.HOUR_IN_MILLIS*24;

Date.prototype.clone = function() {
  return new Date( this.getTime() );
};

Date.prototype.toISODateString = function() {
  return this.toISOString().substring(0,10);
};

Date.prototype.plusSeconds = function(seconds) {
  this.setTime( this.getTime()+(this.SECOND_IN_MILLIS*seconds) );
  return this;
};
Date.prototype.plusMinutes = function(minutes) {
  this.setTime( this.getTime()+(this.HOUR_IN_MILLIS*minutes) );
  return this;
};
Date.prototype.plusHours = function(hours) {
  this.setTime( this.getTime()+(this.HOUR_IN_MILLIS*hours) );
  return this;
};
Date.prototype.plusDays = function(days) {
  this.setTime( this.getTime()+(this.DAY_IN_MILLIS*days) );
  return this;
};

Date.prototype.plusMonths = function(months) {
  this.setMonth( this.getMonth()+months );
  return this;
};

Date.prototype.plusYears = function(years) {
  this.setYear( this.getYears()+years );
  return this;
};

Date.prototype.isOnOrAfter = function(date) {
  return (Math.floor(this.getTime()/this.DAY_IN_MILLIS)>=Math.floor(date.getTime()/this.DAY_IN_MILLIS));
};

Date.prototype.isAfter = function(date) {
  return (this.getTime()>date.getTime());
};

Date.prototype.isBefore = function(date) {
  return (this.getTime()<date.getTime());
};

Date.prototype.isOnOrBefore = function(date) {
  return (Math.floor(this.getTime()/this.DAY_IN_MILLIS)<=Math.floor(date.getTime()/this.DAY_IN_MILLIS));
};

//---- New type, time
var Time = function(hours,minutes,seconds) {
  var self = this;

  if(!hours) hours = 0;

  var parts = hours.split(":");
  if(parts.length>1) {
    hours = parts[0];
  }
  if(parts[1]) {
    minutes = parts[1];
  }
  if(parts[2]) {
    seconds = parts[1];
  }
  if(!minutes) minutes = 0;
  if(!seconds) seconds = 0;

  hours = parseInt(hours);
  minutes = parseInt(minutes);
  seconds = parseInt(seconds);

  self.getTime = function() {
    return ((hours * 3600) + (minutes * 60) + seconds)*1000;
  };

  self.plusSeconds = function( newSeconds ) {
    seconds += parseInt(newSeconds);

    minutes += Math.floor(seconds/60);
    seconds = seconds % 60;

    hours += Math.floor(minutes/60);
    minutes = minutes % 60;
  };

  self.getHours = function() { return hours; };
  self.getMinutes = function() { return minutes; };
  self.getSeconds = function() { return seconds; };

  self.setHours = function(newHours) { hours=newHours; };
  self.setMinutes = function(newMinutes) { minutes=newMinutes; };
  self.setSeconds = function(newSeconds) { seconds=newSeconds; };

  self.plusMinutes = function( newMinutes ) {
    minutes += parseInt(newMinutes);

    hours += Math.floor(minutes/60);
    minutes = minutes % 60;
  };

  self.plusHours = function( newHours ) {
    hours += parseInt(newHours);
  };

  self.isAtOrAfter = function(time) {
    if( self.getTime() >= time.getTime() ) 
      return true;
    else 
      return false;
  };

  self.isAfter = function(time) {
    if( self.getTime() > time.getTime() ) 
      return true;
    else 
      return false;
  };

  self.isAtOrBefore = function(time) {
    if( self.getTime() <= time.getTime() ) 
      return true;
    else 
      return false;
  };

  self.isBefore = function(time) {
    if( self.getTime() < time.getTime() ) 
      return true;
    else 
      return false;
  };

  self.toString = function() {
    return ("" + hours).padBefore("0",2) + ":" + ("" + minutes).padBefore("0",2) + ":" + ("" + seconds).padBefore("0",2);
  };

  self.toShortString = function() {
    return ("" + hours).padBefore("0",2) + ":" + ("" + minutes).padBefore("0",2);
  };
};

//---- Async processing helper
function Process() {
  var callFn;
  var waitTest;
  var thenFn;

  var self = this;

  self.call = function(newCallFn) {
    callFn = newCallFn;
    return self;
  };

  self.waitFor = function(newWaitTest) {
    waitTest = newWaitTest;
    return self;
  };

  self.then = function(newThenFn) {
    thenFn = newThenFn;
    return self;
  };

  var wait = function() {
    if(waitTest()===false) {
      setTimeout(wait,100);
    } else {
      if(thenFn) thenFn();
    }
  };

  self.run = function(data) {
    if(callFn) callFn(data);
    wait();
  };
}