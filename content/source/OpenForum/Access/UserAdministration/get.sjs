var action = transaction.getParameter("action");
if(action===null) {
  transaction.setResult(transaction.SHOW_PAGE);
  return;
}

try{
  action = ""+action;
  result = {result: "error", message: "Action "+action+" not recognised."};

  var UserAdministration = js.getObject("/OpenForum/Access/UserAdministration","UserAdministration.sjs");

  if(action==="createUser") {
    var userName = ""+transaction.getParameter("userName");

    UserAdministration.createUser( userName );

    result = {result: "ok", message: "Performed action "+action};
  } else if(action==="getAllUsers") {

    var users = UserAdministration.getAllUsers( );

    result = {result: "ok", message: "Performed action "+action, users: users};
  } else if(action==="getAllGroups") {

    var groups = UserAdministration.getAllGroups( );

    result = {result: "ok", message: "Performed action "+action, groups: groups};
  } else if(action==="getUsersInGroup") {
    var groupName = ""+transaction.getParameter("groupName");

    var users = UserAdministration.getUsersInGroup( groupName );
    if(!users) {
      result = {result: "error", message: "Performed action "+action+". Group does not exist."};
    } else {
      result = {result: "ok", message: "Performed action "+action, group: groupName, users: users};
    }
  } else if(action==="addUserToGroup") {
    var userName = ""+transaction.getParameter("userName");
    var groupName = ""+transaction.getParameter("groupName");

    var ok = UserAdministration.addUserToGroup(userName,groupName);
    if(ok) {
    	result = {result: "ok", message: "Performed action "+action, group: groupName, userName: userName};
    } else {
    	result = {result: "erro", message: "Performed action "+action+" Failed to add user to group", group: groupName, userName: userName};
    }
  }

} catch(e) {
  transaction.sendJSON( JSON.stringify({result: "error",message: "Error:"+e+" on line "+e.lineNumber+" of "+e.sourceName}));
  return;
}

transaction.sendJSON( JSON.stringify(result) );
