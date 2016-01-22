var action = transaction.getParameter("action");
if( action===null ) {
		transaction.setResult(transaction.SHOW_PAGE);
  return;
}

  action = ""+action; // Cast to String
  result = "";
  
  if(action === "signIn") {
  // do stuff and populate result
  } else {
	result = "action not recognised";
  }

  transaction.sendPage( result );