/*
* Author: 
* Description: 
*/

OpenForum.DataLogger = new function() {
  var self = this;
  
  self.storeData = function(device,postData,callBack) {
    var parameters = getDeviceParameters(device);
    parameters += "&"+getDataParameters(postData);
    parameters += "&"+getTimeParameters();
    parameters += "&record=false";
    JSON.get("/OpenForum/AddOn/DataLogger","logData",parameters).onSuccess(callBack).go();
  };
  
  self.logData = function(device,postData,callBack) {
    var parameters = getDeviceParameters(device);
    parameters += "&"+getDataParameters(postData);
    parameters += "&"+getTimeParameters();
    JSON.get("/OpenForum/AddOn/DataLogger","logData",parameters).onSuccess(callBack).go();
  };
  
  self.getValue = function(device,callBack,key) {
    var parameters = getDeviceParameters(device);
    parameters += "&key="+key;
    JSON.get("/OpenForum/AddOn/DataLogger","getValue",parameters).onSuccess(callBack).go();
  };
  
  self.createDevice = function(serviceId,deviceId,deviceType) {
    return {serviceId: serviceId, deviceId: deviceId, deviceType: deviceType};
  };
  
  var getDeviceParameters = function(device) {
    return "serviceId="+device.serviceId+"&deviceId="+device.deviceId+"&deviceType="+device.deviceType;
  };
  
  var getDataParameters = function(postData) {
    var parameters = "";
    for(var i in postData.data) {
      var key = postData.data[i][0];
      var value = postData.data[i][1];
      
      if(parameters.length>0) parameters+=";";
      parameters += key + ":" + value;
    }
    
    return "data="+parameters;
  };
  
  var getTimeParameters = function() {
    var now = new Date();
    return "time="+now.getTime();
  };
};