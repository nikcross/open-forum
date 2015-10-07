// Service for org.one.stone.soup.wiki.processor.ExternalResourceHelper 
var action = transaction.getParameter("action");
if(action===null) {
	transaction.setResult(transaction.SHOW_PAGE);
	return;
}

if(action=="getURLAsString") {
	var arg0 = transaction.getParameter("arg0");
	var arg1 = transaction.getParameter("arg1");
	var arg2 = transaction.getParameter("arg2");
	transaction.sendPage( external.getURLAsString(arg0,arg1,arg2) );
	return;
}
if(action=="getURLAsString") {
	var arg0 = transaction.getParameter("arg0");
	transaction.sendPage( external.getURLAsString(arg0) );
	return;
}
if(action=="getURLAsFile") {
	var arg0 = transaction.getParameter("arg0");
	var arg1 = transaction.getParameter("arg1");
	var arg2 = transaction.getParameter("arg2");
	transaction.sendPage( external.getURLAsFile(arg0,arg1,arg2) );
	return;
}
if(action=="getURLAsFile") {
	var arg0 = transaction.getParameter("arg0");
	var arg1 = transaction.getParameter("arg1");
	var arg2 = transaction.getParameter("arg2");
	var arg3 = transaction.getParameter("arg3");
	var arg4 = transaction.getParameter("arg4");
	transaction.sendPage( external.getURLAsFile(arg0,arg1,arg2,arg3,arg4) );
	return;
}
