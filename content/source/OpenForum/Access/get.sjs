var action = transaction.getParameter("action");
if(action===null) {
    transaction.setResult(transaction.SHOW_PAGE);
    return;
}

try{
action = ""+action;
result = {result: "error", message: "Action "+action+" not recognised."};

/*---8<---
if(action==="myAction") {
	result = {result: "ok", message: "Performed action "+action};
}
--->8---*/
} catch(e) {
  transaction.sendJSON( JSON.stringify({result: "error",message: "Error:"+e+" on line "+e.lineNumber+" of "+e.sourceName}));
  return;
}
  
transaction.sendJSON( JSON.stringify(result) );

/*

createUser
createGroup
addUserToGroup
addUserAccess
getAllUsers
getAllGroups
getUsersInGroup
getUsersWithAccess
getGroupsWithAccess
addUserAccess
addGroupAccess
removeUser
removeGroup
removeUserAccess
removeGroupAccess

*/