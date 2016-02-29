var action = transaction.getParameter("action");
if( action===null ) {
  transaction.setResult(transaction.SHOW_PAGE);
  return;
}
action = ""+action;
result = {error: "action "+action+" not recognised"};
var sessionStoreMonitor = js.getApi("/OpenForum/SystemMonitor/SessionStoreMonitor");

var users = [];
var jUsers = sessionStoreMonitor.getUsersOnline();
for(var i in jUsers) {
  users.push( ""+jUsers[i] );
}

if(action==="getUsersOnline") {

  result = { usersOnline: users };
}


result = JSON.stringify(result);
transaction.sendPage(result);
