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
Date.prototype.simpleDateFormat = function() {
  return (this.getDay()+1).padBefore(2,"0") + "/" + this.getDay().padBefore(2,"0") + "/" + this.getFullYear();
};

Date.prototype.simpleTimeFormat = function() {
  return (this.getHours()).padBefore(2,"0") + ":" + this.getMinutes().padBefore(2,"0") + ":" + this.getSeconds().padBefore(2,"0");
};