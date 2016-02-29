//---- String extra methods ----
String.prototype.startsWith = function(start) {
  return (this.indexOf(start)===0);
};

String.prototype.between = function(start,end) {
  return this.substring(this.indexOf(start)+start.length,this.indexOf(end));
};

String.prototype.before = function (end) {
  return this.substring(0,this.indexOf(end));
};

String.prototype.after = function (start) {
  return this.substring(this.indexOf(start.length));
};

String.prototype.replaceAll = function(find,replace) {
  return this.replace( new RegExp(find,"g"), replace);
};

String.prototype.padBefore = function(padding,targetLength) {
  var result = this;
  while(this.length<targetLength) {
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

Date.prototype.isAfter = function(date) {
  return (this.getTime()>date.getTime());
};

Date.prototype.isBefore = function(date) {
  return (this.getTime()<date.getTime());
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