//Add any script to run on server start up in here
openForum.setHomePage("/OpenForum/HomePage");

var config = new function () {
  var self = this;
  var values = {};

  var init = function() {
    var map = openForum.getPageAsTable("/OpenForum/Configuration");
    var keys = map.keySet().toArray();
    for(var i in keys) {
      values[keys[i]] = map.get(keys[i]);
    }
  };
  init();
  
  self.getKeys = function() {
    var keys = [];
    for(var i in values) {
      keys.push(i);
    }
    return keys;
  };
  
  self.getValue = function(key) {
    return values[key];
  };
};

openForum.storeObject("config",config);
