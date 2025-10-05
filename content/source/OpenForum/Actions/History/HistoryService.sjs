/*
* Author: 
* Description: 
*/
function HistoryService() {
  var self = this;

  var attachments = js.getObject("/OpenForum/Actions/Attachments","Attachments.sjs");

  var getFileHistory = function( pageName, fileName ) {
    var historyFolderName = pageName+"/history";
    var logFile = fileName + ".log";

    var log = (""+file.getAttachment(historyFolderName,logFile)).split("\n").sort().reverse();
    var historyLog = [];
    for(var entry in log) {
      entry = log[entry];
      entry = entry.replace(/^\s+|\s+$/g, '');
      entry = entry.replace(/\t/g, ' ');
      if(entry.length===0) {
        continue;
      }
      var user = entry.substring(0,entry.indexOf(" "));
      entry = entry.substring(user.length+1);
      var action = entry.substring(0,entry.indexOf(" "));
      entry = entry.substring(action.length+1+fileName.length+1);
      var time = entry;

      historyLog.push( {user: user, action: action, time: time, file: fileName+"-"+time} );
    }

    return {file: fileName,logFile: logFile,history: historyLog};
  };

  var getPageHistory = function( pageName ) {
    var historyFolderName = pageName+"/history";
    var logs = attachments.getList(historyFolderName,".*\\.log");

    var history = [];
    for(var index in logs) {
      var logFile = logs[index];
      var fileName = logFile.substring(0,logFile.indexOf(".log"));

      history.push( getFileHistory(pageName,fileName) );
    }
    return history;
  };

  self.getList = function( pageName, fileName ) {
    if(!fileName) {
      return getPageHistory( pageName );
    } else {
      return getFileHistory( pageName,fileName );
    }
  };

  self.replace = function( pageName, fileName, time, newData) {
    var historyFolderName = pageName+"/history";

    //file.copyAttachment(fileName+"-"+time,historyFolderName,fileName,pageName);
    //file.copyAttachment("test.new-file3-2015-04-15-01-07-49-0420","/Sandbox/history","test.new-file3","/Sandbox");
    throw "Not in use";
  };
}