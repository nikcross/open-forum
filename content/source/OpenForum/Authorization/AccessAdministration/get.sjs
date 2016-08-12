var action = transaction.getParameter("action");
if(action===null) {
    transaction.setResult(transaction.SHOW_PAGE);
    return;
}

try{
action = ""+action;
result = {result: "error", message: "Action "+action+" not recognised."};

var Authorization = js.getObject("/OpenForum/Authorization/AccessAdministration","Authorization.sjs");
  
if(action==="getPageAccess") {
  var pageName = ""+transaction.getParameter("pageName");
  var access = Authorization.getPageAccess(pageName);
  var accessControlPage = Authorization.getAccessControlPage(pageName);
  
  result = {result: "ok", message: "Performed action "+action, access: access, accessControlPage: accessControlPage};
} else if(action==="deletePageAccess") {
  var pageName = ""+transaction.getParameter("pageName");
  Authorization.deletePageAccess(pageName);
  var accessControlPage = Authorization.getAccessControlPage(pageName);
  
  result = {result: "ok", message: "Performed action "+action, access: access, accessControlPage: accessControlPage};
} else if(action==="getUsersWithAccess") {
  var pageName = ""+transaction.getParameter("pageName");
  var actionName = ""+transaction.getParameter("actionName");
  var users = Authorization.getUsersWithAccess(pageName,actionName);
  
  result = {result: "ok", message: "Performed action "+action, pageName: pageName, actionName: actionName,users: users};
} else if(action==="getGroupsWithAccess") {
  var pageName = ""+transaction.getParameter("pageName");
  var actionName = ""+transaction.getParameter("actionName");
  var groups = Authorization.getGroupsWithAccess(pageName,actionName);
  
  result = {result: "ok", message: "Performed action "+action, pageName: pageName, actionName: actionName,groups: groups};
} else if(action==="addUserAccess") {
  var userName = ""+transaction.getParameter("userName");
  var pageName = ""+transaction.getParameter("pageName");
  var actionName = ""+transaction.getParameter("actionName");
  var access = Authorization.addUserAccess(userName,pageName,actionName);
  
  result = {result: "ok", message: "Performed action "+action, userName: userName, pageName: pageName, actionName: actionName, access: access};
} else if(action==="addGroupAccess") {
  var groupName = ""+transaction.getParameter("groupName");
  var pageName = ""+transaction.getParameter("pageName");
  var actionName = ""+transaction.getParameter("actionName");
  var access = Authorization.addGroupAccess(groupName,pageName,actionName);
  
  result = {result: "ok", message: "Performed action "+action, groupName: groupName, pageName: pageName, actionName: actionName, access: access};
} else if(action==="removeUserAccess") {
  var userName = ""+transaction.getParameter("userName");
  var pageName = ""+transaction.getParameter("pageName");
  var actionName = ""+transaction.getParameter("actionName");
  var access = Authorization.removeUserAccess(userName,pageName,actionName);

  result = {result: "ok", message: "Performed action "+action, userName: userName, pageName: pageName, actionName: actionName, access: access};
} else if(action==="removeGroupAccess") {
  var groupName = ""+transaction.getParameter("groupName");
  var pageName = ""+transaction.getParameter("pageName");
  var actionName = ""+transaction.getParameter("actionName");
  var access = Authorization.removeGroupAccess(groupName,pageName,actionName);

  result = {result: "ok", message: "Performed action "+action, groupName: groupName, pageName: pageName, actionName: actionName, access: access};
}
  
} catch(e) {
  transaction.sendJSON( JSON.stringify({result: "error",message: "Error:"+e+" on line "+e.lineNumber+" of "+e.sourceName}));
  return;
}
  
transaction.sendJSON( JSON.stringify(result) );
