/*
* Author: 
* Description: 
*/
var name = transaction.getParameter("name");
if(name===null) {
    transaction.setResult(transaction.SHOW_PAGE);
    return;
}

try{
  transaction.sendPage( "Name: "+name );
  return;
  
} catch(e) {
  transaction.sendPage("Error: "+e);
  return;
}
  
transaction.sendPage( "I'm lost" );
