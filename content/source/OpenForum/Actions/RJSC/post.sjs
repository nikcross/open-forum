try{
var code = transaction.getParameter("code");
var queueName = transaction.getParameter("queueName");

var rjscUser = ""+transaction.getUser();
if(rjscUser!=="Admin" && rjscUser!=="System") {
  transaction.sendJSON( JSON.stringify({result: "error", message: "Forbidden: RJSC requires Admin"}) );
  return;
}

 function println(message) {
   openForum.postMessageToQueue(queueName,message);
 }

 console = {
   log: function(message) {
     println(message);
   }
 };

  println("Status: Running");

  code = ""+code;

  result = eval( code );

  if(result) {
    result = {result: result};
  } else {
   result = {result: "ok", message: "Script Completed"};
  }

  println("Status: Script Completed");

  transaction.sendJSON( JSON.stringify( {result: result} ) );
} catch(e) {
  try{
   println(e);
  }
  catch(e2){}
  transaction.sendJSON( JSON.stringify({result: "error",message: "Error:"+e+" on line "+e.lineNumber}));
}
