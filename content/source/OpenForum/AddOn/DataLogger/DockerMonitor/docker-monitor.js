/*
* Author: 
*/
var DockerMonitor = function() {
  var self = this;
  
  var nodes = [];
  self.stats = [];
  self.updateTime = "...";
  
  var updateStats = function() {
    self.updateTime = toDateTime( new Date().getTime() );
    JSON.get("/OpenForum/AddOn/DataLogger/DockerMonitor","getDockerStats").onSuccess(setStats).go();
  };

  var setStats = function(response) {
    self.stats = response.data;

    for(var i=0;i<self.stats.length;i++) {
      var stat = self.stats[i];

      //Set views
      stat.memory_pc = Math.round(stat.memory*100/stat.totalMemory);
      stat.memory_VIEW = addSuffix( stat.memory," kB", " MB", " GB" );
      stat.totalMemory_VIEW = addSuffix( stat.totalMemory," kB", " MB", " GB" );

      stat.blockIO.read_pc = Math.round(stat.blockIO.read);
      stat.blockIO.read_VIEW = addSuffix( stat.blockIO.read," kB", " MB", " GB" );
      stat.blockIO.write_pc = Math.round(stat.blockIO.write);
      stat.blockIO.write_VIEW = addSuffix( stat.blockIO.write," kB", " MB", " GB" );


      stat.netIO.sent_pc = Math.round(stat.netIO.sent);
      stat.netIO.sent_VIEW = addSuffix( stat.netIO.sent," kB", " MB", " GB" );
      stat.netIO.received_pc = Math.round(stat.netIO.received);
      stat.netIO.received_VIEW = addSuffix( stat.netIO.received," kB", " MB", " GB" );
    }

    self.stats.sort(  function(a,b){ 
      if( a.memory_pc<b.memory_pc ) {
        return 1;
      } else {
        return -1;
      }
    } );

    setTimeout(updateStats,10000);
  };

  var addSuffix = function(v,k,m,g) {
    if(v<1) { //K
      return Math.round(v*1000)+k;
    } else if(v>1000) { //G
      return Math.round(v/1000)+g;
    } else { //M
      return Math.round(v) + m;
    }
  };

  var toDateTime = function(value) {
    var date = new Date();
    date.setTime(value);
    var time = padDigit(date.getHours())+":"+padDigit(date.getMinutes())+":"+padDigit(date.getSeconds());
    return date.toDateString() + " " +time;
  };

  var padDigit = function(value) {
    if(value<10) return "0"+value;
    return value;
  };
  
  self.getServiceStats = function(service) {
    for(var i in self.stats) {
      var stat = self.stats[i];
      if( stat.service == service ) {
        return stat;
      }
    }
    return null;
  };
  
  self.init = function() {
    updateStats();
  };
};

DockerMonitor = new DockerMonitor();