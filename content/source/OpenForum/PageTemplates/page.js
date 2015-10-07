function addPage()
{
	pageName=editForm.pageName.value;
	window.location = "/OpenForum/Edit?pageName=/OpenForum/PageTemplates/"+pageName;
}

function useTemplate()
{
	templateSubmitForm.newPageName.value=templateForm.pageName.value;
	templateSubmitForm.sourcePageName.value = templateForm.template.options[templateForm.template.selectedIndex].value;
	templateSubmitForm.submit();
}

 includeLibrary("/OpenForum/TimeStamp/autorefresh.js");
 includeLibrary("/OpenForum/Javascript/tree.js");
 includeInitFunction("initExplorer();");
function initExplorer()
{
  script = ajax.doGet("/OpenForum/Actions/GetAttachments","pageName=/OpenForum/PageTemplates");
  this.delayedRequest=null;

  rootXml = eval( script );
  rootXml.addAttribute( "title","<b>Page Templates</b>" );
  rootXml.addAttribute( "href","" );
  tree.buildTree(rootXml,"explorer");
}