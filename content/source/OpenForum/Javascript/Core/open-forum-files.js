/*
* Author: 
* Description: 
*/

OpenForum.loadScripts = function(scriptURLs,callback) {
  var scripts="&callback="+callback;
  var index=1;
  for(var scriptIndex in scriptURLs) {
    scripts+="&script"+index+"="+scriptURLs[scriptIndex];
    index++;
  }
  var fileref = document.createElement("script");
  fileref.setAttribute("src",OpenForum.getRoot()+"/OpenForum/Javascripts?action=getScripts"+scripts);
  fileref.setAttribute("type","text/javascript");
  document.getElementsByTagName("head")[0].appendChild(fileref);
};

OpenForum.getAttachments = function(pageName,callBack,matching,withMetaData) {
  var params = "pageName="+pageName;
  if(matching) params += "&matching="+matching;
  if(withMetaData) params += "&metaData=true";

  if(callBack) {
    var action = function(response) {
      callBack( JSON.parse(response) );
    };
    Ajax.sendRequest( new AjaxRequest("GET","/OpenForum/Actions/Attachments",params,null,action,null,true));
  } else {
    return JSON.parse( Ajax.sendRequest( new AjaxRequest("GET","/OpenForum/Actions/Attachments",params,null,null,null,false)) );
  }
};

OpenForum.getSubPages = function(pageName, callBack) {
  var params = "action=getSubPages&pageName="+pageName;

  if(callBack) {
    var action = function(response) {
      callBack( JSON.parse(response) );
    };
    Ajax.sendRequest( new AjaxRequest("GET","/OpenForum/Javascript/Tree",params,null,action,null,true));
  } else {
    return Ajax.sendRequest( new AjaxRequest("GET","/OpenForum/Javascript/Tree",params,null,null,null,false));
  }
};

OpenForum.NO_CACHE = "no-cache";

OpenForum.loadFile = function(fileName,callBack,noCache) {
  if(noCache) {
    if(fileName.indexOf("?")!==-1) {
      fileName += "&ts="+new Date().getTime();
    } else {
      fileName += "?ts="+new Date().getTime();
    }
  }

  if(callBack) {
    Ajax.sendRequest( new AjaxRequest("GET",fileName,"",null,callBack,null,true)  );
  } else {
    return Ajax.sendRequest( new AjaxRequest("GET",fileName,"",null,null,null,false)  );
  }
};

OpenForum.loadJSON = function(fileName,callBack,noCache) {
  if(callBack) {
    var action = function(response) {
      callBack( JSON.parse(response) );
    };
    OpenForum.loadFile(fileName,action,noCache);
  } else {
    return JSON.parse( OpenForum.loadFile(fileName,null,noCache) );
  }
};

OpenForum.loadVersion = function(pageName) {
  if(!pageName) {
    pageName = window.location.pathname;
  }
  OpenForum.loadJSON(pageName+"/release-info.json",function(data) {
    VERSION = data.version;
  }, true);
};

OpenForum.loadXML = function(fileName,callBack,noCache) {
  if(callBack) {
    var action = function(response) {
      var parser = new DOMParser();
      response = parser.parseFromString(response,"text/xml");
      callBack( JSON.parse(response) );
    };
    OpenForum.loadFile(fileName,action,noCache);
  } else {
    var text = OpenForum.loadFile(fileName,null,noCache);
    var parser = new DOMParser();
    text = parser.parseFromString(text,"text/xml");
    return JSON.parse( text );
  }
};

OpenForum.loadDataList = function( fileName ) {
  OpenForum.loadJSON(fileName, function(data) {
    for(var d in data) {
      var name = d;
      var variable = OpenForum.evaluate( name + " = " + JSON.stringify(data[d]) + ";" );

      var list = document.createElement("datalist");
      list.setAttribute("id",name);

      for(var i in data[d]) {
        var option = document.createElement("option");
        option.setAttribute( "value", i );
        list.appendChild( option );
      }
      document.body.appendChild( list );
    }
  });
};

OpenForum.saveFile = function(fileName,data,callBack) {
  var pageName = fileName.substring(0,fileName.lastIndexOf("/"));
  fileName = fileName.substring(fileName.lastIndexOf("/")+1);

  data = "pageName="+encodeURIComponent(pageName)+"&fileName="+encodeURIComponent(fileName)+"&data="+encodeURIComponent(data);

  if(callBack) {
    Ajax.sendRequest( new AjaxRequest(
      "POST",
      "/OpenForum/Actions/Save",
      "returnType=json",
      data,
      function(data) {
        callBack(JSON.parse(data));
      },
      null,
      true));
  } else {
    return JSON.parse( Ajax.sendRequest( new AjaxRequest("POST","/OpenForum/Actions/Save","returnType=json",data,null,null,false)) );
  }
};

OpenForum.saveJSON = function(fileName,data,callBack) {
  data = JSON.stringify(data,null,4);
  return OpenForum.saveFile(fileName,data,callBack);
};

OpenForum.saveXML = function(fileName,data,callBack) {
  data = XMLSerializer.serializeToString(data);
  return OpenForum.saveFile(fileName,data,callBack);
};

OpenForum.appendFile = function(fileName,data,callBack) {
  var pageName = fileName.substring(0,fileName.lastIndexOf("/"));
  fileName = fileName.substring(fileName.lastIndexOf("/")+1);

  var parameters = "action=appendStringToFileNoBackup"+
      "&arg0="+encodeURIComponent(pageName)+"&arg1="+encodeURIComponent(fileName)+"&arg2="+encodeURIComponent(data);

  if(callBack) {
    return Ajax.sendRequest( new AjaxRequest("GET","/OpenForum/Javascript/OpenForumServer/File",parameters,null,callBack,null,true));
  } else {
    return JSON.parse( Ajax.sendRequest( new AjaxRequest("GET","/OpenForum/Javascript/OpenForumServer/File",parameters,null,null,null,false)) );
  }
};

OpenForum.deleteFile = function(pageName,fileName,callBack) {

  var parameters = "pageName="+pageName+
      "&fileName="+fileName+
      "&returnType=json";

  if(callBack) {
    return Ajax.sendRequest( new AjaxRequest("GET","/OpenForum/Actions/Delete",parameters,null,
                                             function(response) { callBack(response.deleted); },
                                             null,true));
  } else {
    var response = Ajax.sendRequest( new AjaxRequest("GET","/OpenForum/Actions/Delete",parameters,null,null,null,false));
    return JSON.parse( response ).deleted;
  }
};

OpenForum.copyFile = function(fileName,toFileName,callBack) {
  var pageName = fileName.substring(0,fileName.lastIndexOf("/"));
  fileName = fileName.substring(fileName.lastIndexOf("/")+1);

  var toPageName = toFileName.substring(0,toFileName.lastIndexOf("/"));
  toFileName = toFileName.substring(toFileName.lastIndexOf("/")+1);

  var parameters = "pageName="+pageName+
      "&fileName="+fileName+
      "&newPageName="+toPageName+
      "&newFileName="+toFileName+
      "&returnType=json";
  if(callBack) {
    return Ajax.sendRequest( new AjaxRequest("GET","/OpenForum/Actions/Copy",parameters,null,callBack,null,true));
  } else {
    return JSON.parse( Ajax.sendRequest( new AjaxRequest("GET","/OpenForum/Actions/Copy",parameters,null,null,null,false)));
  }
};

OpenForum.moveFile = function(fileName,toFileName,callBack) {
  var pageName = fileName.substring(0,fileName.lastIndexOf("/"));
  fileName = fileName.substring(fileName.lastIndexOf("/")+1);

  var toPageName = toFileName.substring(0,toFileName.lastIndexOf("/"));
  toFileName = toFileName.substring(toFileName.lastIndexOf("/")+1);

  var parameters = "pageName="+pageName+
      "&fileName="+fileName+
      "&newPageName="+toPageName+
      "&newFileName="+toFileName+
      "&returnType=json";

  if(callBack) {
    return Ajax.sendRequest( new AjaxRequest("GET","/OpenForum/Actions/Move",parameters,null,callBack,null,true));
  } else {
    return JSON.parse( Ajax.sendRequest( new AjaxRequest("GET","/OpenForum/Actions/Move",parameters,null,null,null,false)) );
  }
};

OpenForum.fileExists = function(fileName) {
  var pageName = fileName.substring(0,fileName.lastIndexOf("/"));
  fileName = fileName.substring(fileName.lastIndexOf("/")+1);

  return JSON.parse( Ajax.sendRequest( new AjaxRequest("GET","/OpenForum/Actions/AttachmentExists","pageName="+pageName+"&fileName="+fileName,null,null,null,false)) );
};

OpenForum.uploadFromURL = function(url,uploadPageName,uploadFileName,callback,callbackError) {
  JSON.get("/OpenForum/Actions/Attach","upload","pageName="+uploadPageName+"&fileName="+uploadFileName+"&url="+url)
    .onSuccess( 
    function() {
      if(callback) callback();
    })
    .onError( 
    function() {
      if(callbackError) callbackError();
    }
  ).go();
};

OpenForum.uploadFile = function(id,pageName,callBack,errorCallBack,progressCallback) {
  var fileName = document.getElementById(id).file.value;
  fileName = fileName.replace(/\\/g,"/");
  fileName = fileName.substring(fileName.lastIndexOf("/")+1);
  var result = OpenForum.loadFile("/OpenForum/Actions/AttachmentExists?pageName="+pageName+"&fileName="+fileName);
  if(result==="true" && confirm("Attachment "+fileName+" exists","Replace this attachment ?")===false ) {
    return;
  }

  var formData = new FormData(document.getElementById( id ));
  var xhr = new XMLHttpRequest();  

  if(callBack) {
    xhr.onload = function() {
      callBack();
    };
  }
  if(errorCallBack) {
    xhr.onerror = function() {
      errorCallBack();
    };
  }

  if(progressCallback) {
    xhr.onprogress = function(event) {
      progressCallback( event.loaded, event.total );
    };    
  }

  xhr.open('POST', "/OpenForum/Actions/Attach?page="+pageName, true);
  xhr.send(formData);
};

