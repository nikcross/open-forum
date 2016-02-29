var action = transaction.getParameter("action");
if(action===null) {
  transaction.setResult(transaction.SHOW_PAGE);
  return;
}

action = ""+action;
result = {result: "error", message: "Action "+action+" not recognised."};

if(action==="getEditor") {
  var pageName = ""+transaction.getParameter("pageName");
  var data = "1";
  var data = js.getObject("/OpenForum/Javascript/Page","Data.js");
  try{
    data.setPageName(pageName);
    result = {result: "ok", pageName: pageName, editor: ""+data.find("editor")};
  } catch(e) {
    result = {result: "error", message: e};
  }
}

transaction.sendJSON( JSON.stringify(result) );
