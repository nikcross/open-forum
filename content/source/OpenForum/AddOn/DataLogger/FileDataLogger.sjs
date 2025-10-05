/*
* Author: Nik Cross
* Description: A server side object to log data to files
* MOVED TO DB DataLogger
*/

function DataLogger() {
  var self = this;
  self.NAME_MODE_PATH = "path";
  self.NAME_MODE_TEXT = "text";

  self.TIME_MODE_DAY = "day";
  self.TIME_MODE_TIME = "time";
  self.TIME_MODE_TIMESTAMP = "timestamp";

  var config = {
    defaultLog: 
    {
      root:"/OpenForum/AddOn/DataLogger/Data/",
      queue:"/OpenForum/AddOn/DataLogger",
      nameMode: self.NAME_MODE_PATH,
      timeMode: self.TIME_MODE_DAY
    }
  };

  self.setConfig = function(newConfig) {
    config = newConfig;
  };

  self.logData = function(data,serviceId,deviceId,deviceType,time,record) {
    var ts = new Date();
    ts.setTime(time);

    data = data.split(";");

    for(var i=0; i<data.length;i++) {   
      var kvp = data[i].split(":");
      var key = kvp[0];
      var value = kvp[1];

      self.storeTimeBasedData(serviceId,deviceId,deviceType,time,key,value);

      if(record===true) {
        wiki.postMessageToQueue( config.defaultLog.queue,"Logged to file "+serviceId+"."+deviceId+"."+key+"="+value ); 

        var fileName = serviceId+"-"+deviceId+"-"+key+".tsv";
        var path = self.getPathFor(fileName,config.defaultLog.nameMode,config.defaultLog.timeMode,time);
        path.pageName = config.defaultLog.root+path.pageName;

        var loggedData = value + "\t" + ts.getTime() + "\n";

        file.appendStringToFileNoBackup( path.pageName,path.fileName,loggedData );
        wiki.postMessageToQueue( config.defaultLog.queue,"Appended to file "+path.pageName+path.fileName ); 
      } else {
        wiki.postMessageToQueue( config.defaultLog.queue,"Stored "+serviceId+"."+deviceId+"."+key+"="+value ); 
      }
    }
  };

  self.getData = function(serviceId,deviceId,key,startTime,endTime) {
	var data = [];
    var maxRows=10000000;
    
    var now = new Date().getTime();
    if(endTime>now) endTime = now;
    if(startTime>endTime) {
      var t = startTime;
      startTime = endTime;
      endTime = t;
    }
    
    var ts = new Date();
    ts.setTime(startTime);
    
    for(var c=0;c<1000;c++) {
      
      var fileName = serviceId+"-"+deviceId+"-"+key+".tsv";
      var path = self.getPathFor(fileName,config.defaultLog.nameMode,config.defaultLog.timeMode,ts.getTime());
      path.pageName = config.defaultLog.root+path.pageName;

      if(file.attachmentExists(path.pageName,path.fileName)) {
        var rawData = "" + file.getAttachment(path.pageName,path.fileName);
        var rows = rawData.split("\n");
		for(var r=0;r<rows.length;r++) {
          var cells = rows[r].split("\t");
          var time = parseInt(cells[1]);
          if(time<startTime) {
            continue;
          }
          if(time>endTime) {
            return data;
          }
          data.push( {value: cells[0], ts: time} );
          if(data.length>=maxRows) {
            return data;
          }
        }
      }
      
      ts.setDate( ts.getDate()+1 );
      if(ts.getTime()>now) {
        return data;
      }
    }
    return data;
  };

  self.storeTimeBasedData = function(serviceId,deviceId,deviceType,timestamp,key,value) {
    wiki.storeValue( "/OpenForum/AddOn/DataLogger/Data/"+serviceId+"."+deviceId+"."+key,value );
    wiki.storeValue( "/OpenForum/AddOn/DataLogger/Data/"+serviceId+"."+deviceId+"."+key+".ts",timestamp );
  };

  self.getLatestValue = function(serviceId,deviceId,key) {
    var value = ""+wiki.retrieveValue( "/OpenForum/AddOn/DataLogger/Data/"+serviceId+"."+deviceId+"."+key);
    var time = parseInt(""+wiki.retrieveValue( "/OpenForum/AddOn/DataLogger/Data/"+serviceId+"."+deviceId+"."+key+".ts"),10);

    return {serviceId: serviceId, deviceId: deviceId, key: key, value: value, time: time};
  };

  var toDDMMYYYY = function(date) {
    var day = date.getDate();
    var month = date.getMonth()+1;
    var year = date.getFullYear();

    var delimeter="-";

    if(day<10) day = "0"+day;
    if(month<10) month = "0"+month;

    return day+delimeter+month+delimeter+year;
  };

  var padNumber = function(number) {
    if(number<10) {
      return "0"+number;
    } else {
      return number;
    }
  };
  /*

path mode
name / surname / account / name.surname.account.txt

text mode
g / ge / geor / george.txt

text + day mode
g / ge / geor / george / 2016 / 01 / george-2016-01-15.txt

text + time mode
g / ge /geor / george / 2016 / 01 / 15 / george-2016-01-15-08-15-35.txt

text + timeStamp mode
g / ge /geor / george / 2016 / 01 / 15 / george-nnnnnnnnnnn.txt

*/

  self.getPathFor = function (fileName,nameMode,timeMode,time) {
    var ext = "";
    var title = fileName;
    if(title.lastIndexOf(".")!=-1) {
      ext = title.substring(title.lastIndexOf("."));
      title = title.substring(0,title.lastIndexOf(".")) ; 
    }
    var path = "";
    if(nameMode===self.NAME_MODE_PATH) {

      path = "/"+title.replace(/\./g,"/")+"/";

    } else if(nameMode===self.NAME_MODE_TEXT) {

      while(title.length<4) {
        title += "-";
      }

      path = "/"+
        title.substring(0,1) + "/" +
        title.substring(0,2) + "/" +
        title.substring(0,4) + "/";

    }

    if(timeMode) {
      if(typeof(time)==="undefined") {
        time = new Date().getTime();
      }
      var date = new Date();
      date.setTime(time);

      if(timeMode===self.TIME_MODE_DAY) {

        path += date.getFullYear() + "/" + padNumber(date.getMonth()+1) + "/";
        title +="-" + date.getFullYear() + "-" + padNumber(date.getMonth()+1) + "-"+ padNumber(date.getDate());

      } else if(timeMode===self.TIME_MODE_TIME) {

        path += date.getFullYear() + "/" + padNumber(date.getMonth()+1) + "/"+ padNumber(date.getDate()) + "/";

        title += "-" + date.getFullYear() + "-" + padNumber(date.getMonth()+1) + "-"+ padNumber(date.getDate());
        title += "-" + padNumber(date.getHours()) + "-" +padNumber(date.getMinutes()) + "-" + padNumber(date.getSeconds());

      } else if(timeMode===self.TIME_MODE_TIMESTAMP) {

        path += date.getFullYear() + "/" + padNumber(date.getMonth()+1) + "/"+ padNumber(date.getDate()) + "/";

        title += "-" + date.getTime();

      }
    }

    return {pageName: path, fileName: title+ext};
  };

}
