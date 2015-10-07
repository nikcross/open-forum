xmlHeader = transaction.getPostFileData();
fileName = transaction.getPostParameter("fileName");
pageName = transaction.getParameter("page");

transaction.userCanPerformAction(pageName,"update",true); 
transaction.confirmPostAttachment(xmlHeader);

user = transaction.getUser();		
wiki.addJournalEntry("File ["+pageName+"/"+fileName+"] added to Page ["+pageName+"] by "+user);
page = wiki.buildPage(pageName);
transaction.goToPage(pageName);