var action = transaction.getParameter("action");
if(action===null) {
  transaction.setResult(transaction.SHOW_PAGE);
  return;
}

action = ""+action;
result = {result: "error", message: "action "+action+" not recognised"};

if(action==="test") {
  var adminEmail = "nikcross@wet-wired.com";
  var mailer = js.getApi("/OpenForum/AddOn/Mailer");
  mailer.sendMail( adminEmail,adminEmail,"Test Email","Test Email @ " + new Date() );
  
  result = {result: "ok", message: "test email sent to "+adminEmail};
}

transaction.sendJSON( JSON.stringify(result) );
