var action = transaction.getParameter("action");
if(action===null) {
  transaction.setResult(transaction.SHOW_PAGE);
  return;
}

try{
  action = ""+action;
  var pageName = ""+transaction.getParameter("pageName");
  result = {result: "error", message: "Action "+action+" not recognised."};

  if(action==="test") {
    var EmailService = js.getObject("/OpenForum/AddOn/Mailer","EmailService.sjs");

    if( transaction.getUser() == "Admin" ) {
      var content = EmailService.sendEmail("Admin",{name: "testName"},"/OpenForum/AddOn/Mailer","test");
      result = {result: "ok", message: "Performed action "+action};
    }
  } else if(action==="viewTest") {
    var EmailService = js.getObject("/OpenForum/AddOn/Mailer","EmailService.sjs");

    var content = EmailService.sendEmail("Admin",{name: "testName"},"/OpenForum/AddOn/Mailer","test");
    transaction.sendPage(content);
    return;
  } else if(action==="getTemplateStub") {
    var EmailService = js.getObject("/OpenForum/AddOn/Mailer","EmailService.sjs");
    var templatePageName = "" + transaction.getParameter("templatePage");
    var templateName = "" + transaction.getParameter("template");

    var data = EmailService.getDataStubForTemplate(templatePage,templateName);
    result = {result: "ok", message: "Performed action "+action, stub: data};
  } else if(action==="send") {
    var toEmail = ""+transaction.getParameter("email");
    var subject = ""+transaction.getParameter("subject");

    var templatePageName = transaction.getParameter("templatePage");
    var templateName = transaction.getParameter("template");
    if(templatePageName==null) {
      templatePageName = "/OpenForum/AddOn/Mailer";
      templateName = "default";
    } else {
      templatePageName = "" + templatePageName;
      templateName = "" + templateName;
    }

    var data = transaction.getParameter("data");
    if(data==null) {
      var message  = ""+transaction.getParameter("message");
      data = {content: message, subject: subject};
    } else {
      data = JSON.parse( "" + data );
      data.subject = subject;
    }
    //data = {subject: subject, content: "" + data};
    
    var EmailService = js.getObject("/OpenForum/AddOn/Mailer","EmailService.sjs");
    var content = EmailService.sendEmail("Admin",data,templatePageName,templateName);

    result = {result: "ok", message: "test email sent to "+toEmail};
  }

} catch(e) {
  transaction.sendJSON( JSON.stringify({result: "error",message: "Error:"+e+" on line "+e.lineNumber+" of "+e.sourceName}));
  return;
}

transaction.sendJSON( JSON.stringify(result) );

