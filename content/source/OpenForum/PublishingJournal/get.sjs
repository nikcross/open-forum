var action = transaction.getParameter("action");
if( action===null ) {
	transaction.setResult(transaction.SHOW_PAGE);
  return;
}

  action = ""+action; // Cast to String
  result = "";
  
  if(action === "published") {
    // ticket=publishingTicket &page=pageName &host=window.location.hostname &port=window.location.port
    var page = ""+transaction.getParameter("page");
    var ticket = ""+transaction.getParameter("ticket");
    var host = ""+transaction.getParameter("host");
    var port = ""+transaction.getParameter("port");
    
    //file.appendStringToFile("/OpenForum/PublishingJournal","page.content","* Published page "+page+" at "+new Date()+" on "+host+":"+port+" Ticket:"+ticket+"\n");
    file.appendStringToFile("/OpenForum/PublishingJournal","page.content","* Published page "+page+" at "+host+":"+port+" Ticket:"+ticket+"\n");
    result = JSON.stringify( {result: "ticket recorded"} );
  } else {
    result = JSON.stringify( {result: "error", message: "action not recognised"});
  }

  transaction.sendJSON( result );