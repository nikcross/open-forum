var script = transaction.getParameter("script");

if(script===null) {
       transaction.setResult(transaction.SHOW_PAGE);
		return;
}

var callBack = transaction.getParameter("callback");

javascript = file.getAttachment("",script);

if(callBack!==null) {
  javascript = javascript+"\n  " + callBack + "(\""+script+"\");";
}

transaction.sendPage(javascript,"js");
