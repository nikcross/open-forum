/*
* Author: Nik Cross
* Description: A server side object to log data to files
* MOVED TO DB DataLogger
*/

function DataLogger() {
  var self = this;
  var delegate = js.getObject("/OpenForum/AddOn/DataLogger","DBDataLogger.sjs");
  
    
  var checkForScript = function(deviceId,data,record,time) {
    var script;
    var scriptFileName = deviceId+"-requested-script.sjs";
    if(file.attachmentExists("/OpenForum/AddOn/DataLogger/RequestedScripts",scriptFileName)) {
      script = ""+file.getAttachment("/OpenForum/AddOn/DataLogger/RequestedScripts",scriptFileName);
      file.deleteAttachmentNoBackup("/OpenForum/AddOn/DataLogger/RequestedScripts",scriptFileName);
    }
    
    if(script) {
      return {result: "ok", message: "Data logged ("+data+").", record: record, script: script};
    } else {
      var d = new Date();
      d.setTime(time);
      return {result: "ok", message: "Data logged ("+data+"). No script to run", record: record};
    }
  };
  
  var checkForLogin = function (serviceId,deviceId,data) {
    var Alert = js.getObject("/OpenForum/AddOn/Alert","Alert.sjs");

    if(serviceId=="securityMonitor") {
      Alert.beatAlert("Login on "+deviceId,data);
    } else {
      Alert.beatAlert("Datalogger for "+deviceId);
    }
  };
  
  self.setConfig = function(newConfig) {
    delegate.setConfig(newConfig);
  };

  self.logData = function(data,serviceId,deviceId,deviceType,time,recordParam,transaction) {
    var record = true;
    if( recordParam ==="false") {
      record = false;
    }
    
    time = parseInt(time,10);
    
    if(record==false) {
      data+=";externalIpAddress:"+transaction.getConnection().getInetAddress();
    }
    delegate.logData(data,serviceId,deviceId,deviceType,time,record);
    
    checkForLogin(serviceId,deviceId,data);
    
    return checkForScript(deviceId,data,record,time);
  };

  self.getData = function(serviceId,deviceId,key,startTime,endTime,groupByParameter) {
    startTime = parseInt( startTime,10);
    endTime = parseInt( endTime,10);
    var groupBy;
    if(groupByParameter!="null") groupBy = "" + groupByParameter;
    
    var data = delegate.getData(serviceId,deviceId,key,startTime,endTime,groupBy);
    
    var startTimeText = new Date(parseInt(startTime)).toString();
    var endTimeText = new Date(parseInt(endTime)).toString();
    
    var result = {result: "ok", serviceId: serviceId, deviceId: deviceId, key: key,
                  startTime: startTime, endTime: endTime,
                  groupBy: groupBy, startTimeText: startTimeText, endTimeText: endTimeText, 
                  data: data};

    return result;
  };

  self.storeTimeBasedData = function(serviceId,deviceId,deviceType,timestamp,key,value) {
    delegate.storeTimeBasedData(serviceId,deviceId,deviceType,timestamp,key,value);
  };

  self.getLatestValue = function(serviceId,deviceId,key) {
    var data = delegate.getLatestValue(serviceId,deviceId,key);
    data.result = "ok";
    return data;
  };

  self.getPathFor = function (fileName,nameMode,timeMode,time) {
    return delegate.getPathFor(fileName,nameMode,timeMode,time);
  };

}
