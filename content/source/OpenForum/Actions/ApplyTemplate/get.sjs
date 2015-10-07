if(typeof(pageName)=="undefined")
{
	transaction.setResult(transaction.SHOW_PAGE);
}
else
{
  templatePage = transaction.getParameter("templatePage");
  headerTemplateFile = transaction.getParameter("headerTemplateFile");
  footerTemplateFile = transaction.getParameter("footerTemplateFile");

  file.saveAttachment( pageName,"header.html.template.link",templatePage+"/"+headerTemplateFile );
  file.saveAttachment( pageName,"footer.html.template.link",templatePage+"/"+footerTemplateFile );
  wiki.buildPage(pageName);

  transaction.goToPage( pageName );
}