/*
* Author: Nik Cross
* Description: A server side object to log data to files
*/

function DBDataLogger() {
  var self = this;
  self.DATABASE = "open-forum";
  self.TABLE = "data_logger";

  var config = {
    defaultLog: 
    {
      queue:"/OpenForum/AddOn/DataLogger",
      database: self.DATABASE,
      table: self.TABLE
    }
  };
  
  var db = js.getObject( "/OpenForum/AddOn/SQL","DB.sjs" );
  db.setAlias(config.defaultLog.database);

  self.setConfig = function(newConfig) {
    config = newConfig;
    db.setAlias(config.defaultLog.database);
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
        wiki.postMessageToQueue( config.defaultLog.queue,"Logged in DB "+serviceId+"."+deviceId+"."+key+"="+value+" @" +new Date(time) );
        
        //service_id (text)	device_type (text)	device_id (text)	data_key (text)	data_value (numeric)	time_stamp (numeric)
        var sql = "insert into " + config.defaultLog.table + " (service_id,	device_type, device_id, data_key, data_value, time_stamp)"+
            "values ('"+serviceId+"','"+deviceType+"','"+deviceId+"','"+key+"',"+value+","+time+")";
        
        db.execute(sql);
        
      } else {
        wiki.postMessageToQueue( config.defaultLog.queue,"Stored "+serviceId+"."+deviceId+"."+key+"="+value+" @" +new Date(time) ); 
      }
    }
  };

  self.getData = function(serviceId,deviceId,key,startTime,endTime,groupBy) {
    //var data = [];
    var maxRows = 46080; // A bit more than a month in 1 minute periods
    
    var result = [];
    var timeCursor = startTime;
    
    for(var i=0; i<10; i++) { // Up to 10 queries to get data in chunks
      var sql = "select service_id as serviceId, device_id as deviceId, data_key as key, data_value as value, time_stamp as time"+
          " from " + config.defaultLog.table + " where service_id='" + serviceId + "' and device_id='" + deviceId + "' and data_key='" + key + "'" +
          " and time_stamp>" + timeCursor + " and time_stamp<" + endTime + " order by time_stamp asc limit "+(maxRows/10);

      var subResult = db.query(sql);
      subResult = db.convertResultToObject( subResult );
      
      if(result.length==0) {
        result = subResult;
      } else {
      	result = result.concat( subResult );
      }
      
      if(subResult.length==0) break;
      timeCursor = subResult[ subResult.length-1 ].time;
    }
  
    if(result.length==0) return result;
    
    if(groupBy != "null") {
      
      result.groupBy = "groupBy-" + groupBy;
      
       var period = 1;
      if(groupBy=="10min") period = 1000 * 60 * 10;
      if(groupBy=="30min") period = 1000 * 60 * 30;
      if(groupBy=="hour") period = 1000 * 60 * 60;
      if(groupBy=="day") period = 1000 * 60 * 60 * 24;
      
        var current = startTime;
        var end = endTime;
        var next = startTime + period;
        var total = 0;
        var readings = 0;
        var newResult = [];
      	var lastTime = current;
        
        for(var i in result) {
          if(result[i].time>=next) {
            
            var newCurrent = current;
            while( (newCurrent+period)<result[i].time ) {
              newCurrent += period;
            }
            if(newCurrent != current) {
            	current = newCurrent - period;
            	next = current + period;
            }
            
            newResult.push( 
                {
                  serviceid: result[i].serviceid,
                  deviceid: result[i].deviceid,
                  key: result[i].key,
                  value: total,
                  //db: newCurrent + " = " + next + " = " + i + " = " + result[i].time,
                  time: current,
                  readings: readings
                }
            );
            
            if(result[i].time > end) break;
            current = next;
            next += period;
            total = 0;
            readings = 0;
          }
          
          if(result[i].time<=end) {
          	readings ++;
          	total += parseFloat(result[i].value);
          }
        }
        result = newResult;
      }
    
    return result;
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
}

