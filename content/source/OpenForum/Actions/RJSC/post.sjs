try{
code = transaction.getParameter("code");
queueName = transaction.getParameter("queueName");

 function println(message)
 {
   wiki.postMessageToQueue(queueName,message);
 }

  println("Running");

  code = ""+code;

  result = eval( code );

  if(result)
  {
   transaction.sendPage( result );
  }
  else
  {
    transaction.sendPage("OK");
  }

  println("Complete");
}
catch(e)
{
  try{
   println(e);
  }
  catch(e2){}
  transaction.sendPage( e );
}