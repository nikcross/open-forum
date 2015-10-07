var action = transaction.getParameter("action");
if( action===null ) {
	transaction.setResult(transaction.SHOW_PAGE);
  return;
}
action = ""+action;
result = {error: "action "+action+" not recognised"};
var sessionStoreMonitor = js.getApi("/OpenForum/SystemMonitor/SessionStoreMonitor");

if(action==="getUsersOnline") {
  
  result = { 
            usersOnline: sessionStoreMonitor.getUsersOnline();
           };
}


result = JSON.stringify(result);
transaction.sendPage(result);
