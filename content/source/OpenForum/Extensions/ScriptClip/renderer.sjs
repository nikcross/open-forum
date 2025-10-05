/*
* Author: 
* Description: 
*/

try{
  var script = extension.getAttribute("script");

  var fileName = extension.getAttribute("fileName");
  var scriptPageName = extension.getAttribute("scriptPageName");
  if( fileName!=null ) {
    if( scriptPageName==null ) scriptPageName = pageName;
    
    if(file.attachmentExists( scriptPageName, fileName )) {
		script = file.getAttachment( scriptPageName, fileName );
    } else {
      script = "";
    }
  }
  script = ""+script;

  var id = extension.getAttribute("id");
  var ofId = "";
  if(id==null) {
    id =  ""+js.generateMD5(script).substring(0,8);
  } else {
    id = "" + id;
    ofId = "of-id='" + id + "'";
  }
  
  var rows = script.split("\n").length+1;

  script = script.replace(/</g,"&lt;").replace(/>/g,"&gt;");

  var html = "<div class='row'><div class='columns large-10'><textarea style='border: none; background-color: black; color: lightgreen; font-family: monospace;' " + ofId + " id='" + id + "' rows='"+rows+"' >"+script+"</textarea></div>"+
      "<div class='columns large-2'>"+
      "<a href='#' title='Copy to clipboard' onClick='"+
      "OpenForum.copyElement(\""+id+"\"); return false;"+
      "'><img src='/OpenForum/Images/icons/png/page_copy.png' /></a>"+
      "</div></div><script>document.getElementById('" + id + "').setAttribute('readonly', 'readonly');</script>";

  return html;
} catch(e) {
  return ""+e;
}
