//Version 0.1
var action = transaction.getParameter("action");

if(action===null) {
  transaction.setResult(transaction.SHOW_PAGE);
  return;
}

//Moved to /OpenForum/AddOn/ServiceBuilder