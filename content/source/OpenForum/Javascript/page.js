includeLibrary("/OpenForum/Javascript/ajax.js");
function testAjaxGet()
{
var r = new AjaxRequest("GET","/OpenForum/Javascript/test-data.txt","","","alert('Got &response;');setValue('&response;')");
postRequest(r);
}
function testAjaxPost()
{
data = document.getElementById("testForm").data.value;
data = escape(data);
var r = new AjaxRequest("POST","/OpenForum/Save","","pageName=/OpenForum/JavaScript&fileName=test-data.txt&data="+data,"alert('Posted &response;');");
postRequest(r);
}
function setValue(value)
{
  document.getElementById("testForm").data.value = unescape(value);
}

function testConfirm()
{
 showConfirm('Title','Press OK for action','window.location=\\\"/Home\\\";');
}