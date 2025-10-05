/*
* Author: 
* Description: 
*/

var DataLogger = function(serviceId,deviceId) {
  var self = this;
  
  var extractData = function(response) {
    var extract = [];
    for(var i in response.data) {
      extract.push( response.data[i].value );
    }
    return extract;
  };
  
  self.getValue = function(key,callBack) {
      JSON.get("/OpenForum/AddOn/DataLogger","getValue",
                        "serviceId="+serviceId+
                        "&deviceId="+deviceId+
                        "&key="+key
              ).
  		onSuccess(callBack).
  		go(); 
  };
  
  self.getData = function(key,startTime,endTime,groupBy,callBack) {
    JSON.get("/OpenForum/AddOn/DataLogger","getData",
                        "serviceId="+serviceId+
                        "&deviceId="+deviceId+
                        "&key="+key+
                        "&startTime="+startTime+
                        "&endTime="+endTime+
                        "&groupBy="+groupBy
                       ).
    onSuccess( function(response) {
      var extracted = extractData(response);
      callBack(extracted);
    }).go();
    
  };
  
  self.getDaysData = function(key,callBack) {
    var startTime = new Date();
    startTime.setHours(0);
    startTime.setMinutes(0);
    startTime.setSeconds(0);
    
    var endTime = new Date();
    
    self.getData(key,startTime.getTime(),endTime.getTime(),"30min",callBack);
  };
  
  self.getHoursData = function(key,callBack) {
    var startTime = new Date();
    startTime.setMinutes(0);
    startTime.setSeconds(0);
    
    var endTime = new Date();
    
    self.getData(key,startTime.getTime(),endTime.getTime(),"1min",callBack);
  };
};