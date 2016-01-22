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
  var data = js.getObject("/OpenForum/Javascript/Page","Data.js");//.getData(pageName);
  try{
  var data = data.getData("/TheLab/Sandbox");
  result = {result: "ok", editor: ""+data.getEditor()};
  } catch(e) {
	result = {result: "error", message: e};
  }
}

transaction.sendJSON( JSON.stringify(result) );
