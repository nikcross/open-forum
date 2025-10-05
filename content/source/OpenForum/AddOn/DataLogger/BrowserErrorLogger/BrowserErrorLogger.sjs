/*
* Author: 
* Description: 
*/

var BrowserErrorLogger = function() {
  var self = this;
  var LOG_PAGE = "/OpenForum/AddOn/DataLogger/BrowserErrorLogger";
  var MAX_LOG_FILE_SIZE = 10000;
  var HEAT_REDUCTION_FACTOR = 0.75;
  var HEAT_EXPIRE_LEVEL = 0.25;
  var HEAT_ALERT_LEVEL = 3;

  var siteOriginMap = {
    "https://open-forum.onestonesoup.org": "One Stone Soup (OpenForum)",
    "https://rensmart.com": "RenSMART"
  };
  
  function getLogFileDate(date) {
    var logFileDate = date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate();
    return logFileDate;
  }

  self.logError = function(site,origin,page,error) {
    var now = new Date();

    if( typeof site == "undefined" ) {
      site = siteOriginMap[ origin ];
    }
    
    openForum.postMessageToQueue( "Browser.error",site + "\t" + page + "\t" + error );
    
    var fileName = getLogFileDate(now) + "-error-log.txt";
    var key = site + "\t" + page + "\t" + error;
    var row = now.getTime() + "\t" + key;
    
    var heatList = JSON.parse( "" + file.getAttachment(LOG_PAGE,"error-heat-list.json") );
    
    if(file.attachmentExists(LOG_PAGE,fileName)==false) { // Fist log of new day

      //Delete seven day old log
      //Keep seven days
      var oldestDate = new Date( now.getTime() );
      oldestDate.setDate( oldestDate.getDate()-8 );
      var oldFile = getLogFileDate(oldestDate) + "-error-log.txt";
      if(file.attachmentExists(LOG_PAGE,oldFile)==true) {
        file.deleteAttachmentNoBackup(LOG_PAGE, oldFile);
      }

      file.appendStringToFileNoBackup( LOG_PAGE , fileName , "Error Log File For " + now + "\n\n" );
      
      var newList = [];
      for( var i in heatList ) {
        heatList[i].heat = heatList[i].heat * HEAT_REDUCTION_FACTOR;
        if( heatList[i].heat >= HEAT_EXPIRE_LEVEL ) {
          newList.push( heatList[i] );
        }
      }
      heatList = newList;
    }
    
    file.appendStringToFileNoBackup( LOG_PAGE , fileName , now + " : " + row + "\n" );
    
    if( file.getAttachmentSize(  LOG_PAGE , fileName ) > MAX_LOG_FILE_SIZE ) {
      var Alert = js.getObject("/OpenForum/AddOn/Alert","Alert.sjs");
      Alert.triggerAlert("Browser Error Log Too Big","Error log "+LOG_PAGE+"/" + fileName + " is " + Math.round( file.getAttachmentSize(  LOG_PAGE , fileName )/1000 ) + "kB" );
    }
    
    var found = false;
    for( var h in heatList ) {
      var entry = heatList[h];
      if( entry.key == key ) {
        found = true;
        entry.occured = entry.occured + 1;
        entry.heat = entry.heat + 1;
        entry.lastTime = now.getTime();
        
        if( entry.heat >= HEAT_ALERT_LEVEL ) {
      		var Alert = js.getObject("/OpenForum/AddOn/Alert","Alert.sjs");
      		Alert.triggerAlert("Browser Error Heat Alert","Browser Error Heat Level " + entry.heat + " for " + key );
        }
      }
    }
    if( !found ) {
      heatList.push( { key: key, firstTime: now.getTime(), lastTime: now.getTime(), heat: 1, occured: 1 } );
    }
    file.saveAttachmentNoBackup( LOG_PAGE,"error-heat-list.json", JSON.stringify( heatList, null, 4 ) );
    
    return "Error logged";
  };

  /*---8<---Add Funtions Below Here--->8---*/
};
