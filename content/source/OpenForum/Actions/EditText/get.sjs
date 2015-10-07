if(typeof(pageName)=="undefined")
{
       transaction.setResult(transaction.SHOW_PAGE);
}
else
{
 template = file.getAttachment("/OpenForum/Actions/EditText","editText.html.template");
 fileName = transaction.getParameter("fileName");

 source = file.getAttachment(pageName,fileName,false);

 if(source==null)
 {
   source="";
 }

 source = source.replace("&","&amp;").replace("<","&lt;").replace(">","&gt;");


 data = js.get2DStringArrayAsMap(
[["pageName",pageName],["fileName",fileName],["source",source]] );
 pageData = js.getTemplateHelper().generateStringWithTemplate(
template,data );

 transaction.sendPage( wiki.buildPage("Edit Text",pageData) );
}