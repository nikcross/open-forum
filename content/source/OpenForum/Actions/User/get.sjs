var action = transaction.getParameter("action");
if( action===null ) {
	transaction.setResult(transaction.SHOW_PAGE);
  return;
}

  action = ""+action; // Cast to String
  result = "";
  
  if(action === "getCurrentUser") {
	var user = transaction.getUser();
    result = JSON.stringify(user);
  } else {
      result = "action not recognised";
  }

  transaction.sendPage( result );