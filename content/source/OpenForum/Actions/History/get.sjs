var action = transaction.getParameter("action");
if( action===null ) {
	transaction.setResult(transaction.SHOW_PAGE);
  return;
}
  var pageName = ""+transaction.getParameter("pageName");
  var historyFolderName = pageName+"/history";

  action = ""+action; // Cast to String
  result = "";
  
  if(action === "list") {
  // do stuff and populate result
    var attachments = js.getObject("/OpenForum/Actions/Attachments","Attachments.sjs");
	var logs = attachments.getList(historyFolderName,".*\\.log");
    
    var history = [];
    for(var index in logs) {
      var logFile = logs[index];
      var fileName = logFile.substring(0,logFile.indexOf(".log"));
      
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
     
      var historyRecord = {file: fileName,logFile: logFile,history: historyLog};
      
      history.push(historyRecord);
    }
    
    result = JSON.stringify(history);
  } else if(action === "replace") {
      var fileName = ""+transaction.getParameter("fileName");
      var time = ""+transaction.getParameter("time");
    
    //file.copyAttachment(fileName+"-"+time,historyFolderName,fileName,pageName);
    file.copyAttachment("test.new-file3-2015-04-15-01-07-49-0420","/Sandbox/history","test.new-file3","/Sandbox");
    
    result = JSON.stringify( {result: "ok", message: "Replaced "+pageName+"/"+fileName+" with "+historyFolderName+"/"+fileName+"-"+time} );
  } else {
    result = JSON.stringify({result: "error", message: "action not recognised"+action});
  }

  transaction.sendJSON( result );