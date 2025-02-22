if(!OpenForum) {
  OpenForum = {};
}
OpenForum.User = { user: "Guest" };

JSON.get("/OpenForum/Actions/User","getCurrentUser").onSuccess( function (response) {  OpenForum.User.user = response;  } ).go();

  OpenForum.User.loadFile = function(fileName) {
    fileName = "/OpenForum/Users/"+OpenForum.User.user+"/"+fileName;
    
    if(fileName.indexOf("?")!==-1) {
      fileName += "&ts="+new Date().getTime();
    } else {
      fileName += "?ts="+new Date().getTime();
    }
    return Ajax.sendRequest( new AjaxRequest("GET",fileName,"",null,null,null,false)  );
  };

  OpenForum.User.saveFile = function(fileName,data) {
    fileName = "/OpenForum/Users/"+OpenForum.User.user+"/"+fileName;
    
    var pageName = fileName.substring(0,fileName.lastIndexOf("/"));
    fileName = fileName.substring(fileName.lastIndexOf("/")+1);

    data = "pageName="+encodeURIComponent(pageName)+"&fileName="+encodeURIComponent(fileName)+"&data="+encodeURIComponent(data);

    return eval("(" + Ajax.sendRequest( new AjaxRequest("POST","/OpenForum/Actions/Save","returnType=json",data,null,null,false)) + ")");
  };
  
  OpenForum.User.deleteFile = function(fileName) {
    var pageName = fileName.substring(0,fileName.lastIndexOf("/"));
    
    pageName = "/OpenForum/Users/"+OpenForum.User.user+"/"+pageName;

    var parameters = "action=deleteAttachmentNoBackup"+
        "&arg0="+pageName+
        "&arg1="+fileName;

    return eval("(" + Ajax.sendRequest( new AjaxRequest("GET","/OpenForum/Javascript/OpenForumServer/File",parameters,null,null,null,false)) + ")");
  };
  
  OpenForum.User.copyFile = function(fileName,toFileName) {
    fileName = "/OpenForum/Users/"+OpenForum.User.user+"/"+fileName;
    toFileName = "/OpenForum/Users/"+OpenForum.User.user+"/"+toFileName;
    
    var pageName = fileName.substring(0,fileName.lastIndexOf("/"));
    fileName = fileName.substring(fileName.lastIndexOf("/")+1);
    
    var toPageName = toFileName.substring(0,toFileName.lastIndexOf("/"));
    toFileName = toFileName.substring(toFileName.lastIndexOf("/")+1);

    var parameters = "pageName="+pageName+
      "&fileName="+fileName+
      "&newPageName="+toPageName+
      "&newFileName="+toFileName+
      "&returnType=json";

    return eval("(" + Ajax.sendRequest( new AjaxRequest("GET","/OpenForum/Actions/Copy",parameters,null,null,null,false)) + ")");
  };

  OpenForum.User.moveFile = function(fileName,toFileName) {
    fileName = "/OpenForum/Users/"+OpenForum.User.user+"/"+fileName;
    toFileName = "/OpenForum/Users/"+OpenForum.User.user+"/"+toFileName;
    
    var pageName = fileName.substring(0,fileName.lastIndexOf("/"));
    fileName = fileName.substring(fileName.lastIndexOf("/")+1);
    
    var toPageName = toFileName.substring(0,toFileName.lastIndexOf("/"));
    toFileName = toFileName.substring(toFileName.lastIndexOf("/")+1);

    var parameters = "pageName="+pageName+
      "&fileName="+fileName+
      "&newPageName="+toPageName+
      "&newFileName="+toFileName+
      "&returnType=json";

    return eval("(" + Ajax.sendRequest( new AjaxRequest("GET","/OpenForum/Actions/Move",parameters,null,null,null,false)) + ")");
  };
  
  OpenForum.User.fileExists = function(fileName) {
    fileName = "/OpenForum/Users/"+OpenForum.User.user+"/"+fileName;
    
    var pageName = fileName.substring(0,fileName.lastIndexOf("/"));
    fileName = fileName.substring(fileName.lastIndexOf("/")+1);

    return JSON.parse( Ajax.sendRequest( new AjaxRequest("GET","/OpenForum/Actions/AttachmentExists","pageName="+pageName+"&fileName="+fileName,null,null,null,false)) );
  };

  OpenForum.User.uploadFile = function(id,pageName) {
    pageName = "/OpenForum/Users/"+OpenForum.User.user+"/"+pageName;
    
    var fileName = document.getElementById(id).file.value;
    fileName = fileName.replace(/\\/g,"/");
    fileName = fileName.substring(fileName.lastIndexOf("/")+1);
    var result = this.loadFile("/OpenForum/Actions/AttachmentExists?pageName="+pageName+"&fileName="+fileName);
    if(result==="true" && confirm("Attachment "+fileName+" exists","Replace this attachment ?")===false ) {
      return;
    }
    document.getElementById(id).action="/OpenForum/Actions/Attach?page="+pageName;
    document.getElementById(id).statusQueue.value = statusQueueName;
    document.getElementById(id).submit();
  };

OpenForum.User.getUserRoot = function() {
  return "/OpenForum/Users/"+OpenForum.User.user;
};
