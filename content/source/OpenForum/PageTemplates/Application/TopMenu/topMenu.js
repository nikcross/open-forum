function createAttachment()
{
  fileName = prompt("Enter File Name",".txt");
  if(fileName==null)
  {
    return;
  }

result = ajax.doGet("/OpenForum/Actions/AttachmentExists","pageName="+pageName+"&fileName="+fileName);

  if(result=="true")
  {
    ui.showConfirm("Attachment "+fileName+" exists","Replace this attachment ?","_createAttachment();");
  }
  else
  {
    _createAttachment();
  }
}

function _createAttachment()
{
    fileManager.saveFile(pageName,fileName,"");
    window.location = "/OpenForum/Actions/EditText?pageName="+pageName+"&fileName="+fileName;
}
function createNewPage()
{
  newPageName = prompt("Enter Page Name","");
  if(newPageName==null)
  {
    return;
  }

  if( isValidPageName(newPageName)==false )
  {
    return;
  }

result = ajax.doGet("/OpenForum/Actions/PageExists","pageName="+newPageName );
  if(result=="true")
  {
    ui.showConfirm("Page "+newPageName +" exists","Replace the page ?","_createNewPage();");
  }
  else
  {
    _createNewPage();
  }
}

function _createNewPage()
{
  window.location = "/OpenForum/Actions/Edit?pageName="+newPageName;
}
function createNewChildPage()
{
  newPageName = prompt("Enter Child Page Name","");

  if( isValidPageName(newPageName)==false )
  {
    return;
  }

  if(newPageName==null)
  {
    return;
  }

result = ajax.doGet("/OpenForum/Actions/PageExists","pageName="+pageName+"/"+newPageName );
  if(result=="true")
  {
    ui.showConfirm("Page "+newPageName +" exists","Replace the page ?","_createNewChildPage();");
  }
  else
  {
    _createNewChildPage();
  }
}

function _createNewChildPage()
{
  window.location = "/OpenForum/Actions/Edit?pageName="+pageName+"/"+newPageName;
}

function deletePage()
{
  ui.showConfirm("Confirm","Delete this page","_deletePage();");
}

function _deletePage()
{
  window.location = "/OpenForum/Actions/Delete?pageName="+pageName;
}

function refreshPage()
{
  window.location = "/OpenForum/Actions/RefreshPage?pageName="+pageName;
}

function copyPage()
{
  newPageName= prompt("Enter New Page Name","Copy of "+pageName);

  if( isValidPageName(newPageName)==false )
  {
    return;
  }

  if(newPageName==null)
  {
    return;
  }
result = ajax.doGet("/OpenForum/Actions/PageExists","pageName="+newPageName );
  if(result=="true")
  {
    ui.showConfirm("Page "+newPageName +" exists","Replace the page ?","_copyPage();");
  }
  else
  {
    _copyPage();
  }
}

function _copyPage()
{
   ui.showMessage("Please Wait...","Copying "+pageName+" to "+newPageName);
    window.location = "/OpenForum/Actions/Copy?sourcePageName="+pageName+"&newPageName="+newPageName;
}

function movePage()
{
  newPageName= prompt("Enter New Page Name",pageName);

  if( isValidPageName(newPageName)==false )
  {
    return;
  }

  if(newPageName==null)
  {
    return;
  }
result = ajax.doGet("/OpenForum/Actions/PageExists","pageName="+newPageName );
  if(result=="true")
  {
    ui.showConfirm("Page "+newPageName +" exists","Replace the page ?","_movePage();");
  }
  else
  {
    _movePage();
  }
}

function _movePage()
{
    ui.showMessage("Please Wait...","Moving "+pageName+" to "+newPageName);
    window.location = "/OpenForum/Actions/Move?pageName="+pageName+"&newPageName="+newPageName;
}

function popout(page)
{
  poppy = window.open(page,"poppy","width=400,height=20,toolbar=no,scrollbar=no,menubar=no,scrollbar=no,titlebar=no,status=no");
}

function isValidPageName(name)
{
  result = ajax.doGet("/OpenForum/Actions/ValidatePageName?pageName="+name);

  if(result=="OK")
  {
    return true;
  }
  else
  {
    ui.showAlert( "Invalid Name","A Wiki page "+result );
    return false;
  }
}

currentMenuLayer = null;

function toggleMenuLayer(layerId)
{
	layer = document.getElementById(layerId);

   if(layer.style.display=="block")
   {
	layer.style.display="none";
	currentMenuLayer = null;
   }
   else
   {
	layer.style.display="block";

	if(currentMenuLayer!=null)
	{
		currentMenuLayer.style.display="none";
	}
	currentMenuLayer = layer;
   }
}