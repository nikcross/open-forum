code = transaction.getParameter("code");
queueName = transaction.getParameter("queueName");
if( code===null )
{
  transaction.setResult(transaction.SHOW_PAGE);
  return;
}

try{
 function println(message) {
   openForum.postMessageToQueue(queueName,message);
 }

  println("Running");

  code = ""+code;

  result = eval( code );

  if(result) {
    result = {result: result};
  } else {
   result = {result: "ok", message: "Script Completed"};
  }

  println("Complete");
  
  transaction.sendJSON( JSON.stringify( {result: result} ) );
}
catch(e)
{
  try{
   println(e);
  }
  catch(e2){}
  transaction.sendJSON( JSON.stringify({result: "error",message: "Error:"+e+" on line "+e.lineNumber+" of "+e.sourceName, saved: false}));
}