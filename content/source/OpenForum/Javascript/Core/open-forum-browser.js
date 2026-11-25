if(!OpenForum) {
  OpenForum = {};
}

OpenForum.Browser={};

OpenForum.Browser.download = function(fileName,data){
  var hiddenElement = document.createElement('a');
  hiddenElement.href = 'data:attachment/text,' + encodeURIComponent(data);
  hiddenElement.target = '_blank';
  hiddenElement.style.display = "none";
  hiddenElement.download = fileName;
  document.body.appendChild(hiddenElement);
  hiddenElement.click();
};

OpenForum.Browser.upload = function(callback,onError) {
  var hiddenElement = document.createElement('input');
  hiddenElement.type = "file";
  hiddenElement.style.display = "none";
  hiddenElement.onchange = function(event) {
    var reader = new FileReader();

    reader.onload = function(event) {
      if(event.target.readyState != 2) return;
      if(event.target.error) {
        if(onError) {
          onError('Error while reading file');
        } else {
          alert('Error while reading file');
        }
        return;
      }
      callback( event.target.result );
    };
    reader.readAsText(event.target.files[0]);
  };
  document.body.appendChild(hiddenElement);
  hiddenElement.click();
};

OpenForum.Browser.uploadDataUrl = function(callback,onError) {
  var hiddenElement = document.createElement('input');
  hiddenElement.type = "file";
  hiddenElement.style.display = "none";
  hiddenElement.onchange = function(event) {
    var reader = new FileReader();

    reader.onload = function(event) {
      if(event.target.readyState != 2) return;
      if(event.target.error) {
        if(onError) {
          onError('Error while reading file');
        } else {
          alert('Error while reading file');
        }
        return;
      }
      callback( event.target.result );
    };
    reader.readAsDataURL(event.target.files[0]);
  };
  document.body.appendChild(hiddenElement);
  hiddenElement.click();
};

OpenForum.Browser.overrideSave = function(fn) {
  $(document).bind('keydown', function(e) {
    if(e.ctrlKey && (e.which == 83)) {
      e.preventDefault();
      fn();
      return false;
    }
  });
};

OpenForum.Browser.isBrowserStorageEnabled = function() {
  return ( typeof OpenForum.findBrowserFileTreeNode != "undefined" );
};

OpenForum.Browser.enableBrowserStorage = function() {
  if( OpenForum.Browser.isBrowserStorageEnabled() ) {
    console.log("Browser Storage already enabled");
    return;
  }

  OpenForum.findBrowserFileTreeNode = function( pageName ) {
    pageName = pageName.replace("browser:/","");

    var list = OpenForum.Storage.find("browserFS "+pageName+"*.");
    var data = [];

    var found = {};

    for(var a in list) {
      var fileName = list[a].key.substring( pageName.length + 10);

      if(fileName.startsWith("/")) fileName = fileName.substring(1);

      if(fileName.indexOf("/")!=-1) {
        var page = fileName.substring(0,fileName.indexOf("/"));
        if( page.length==0 ) continue;
        if( typeof found[page] == "undefined" ) {
          data.push( {fileName: page, type: "page"} );
          found[page] = true;
        }
      } else {
        if( fileName.length==0 ) continue;

        if( typeof found[fileName] == "undefined" ) {
          var extension = fileName.substring( fileName.indexOf(".")+1 );
          data.push( {fileName: fileName, type: "file", extension: ""} );
          found[fileName] = true;
        }
      }
    }

    return data;
  };

  OpenForum.remoteSave = OpenForum.saveFile;
  OpenForum.saveFile = function(fileName,data,callBack) {
    if(fileName.startsWith("browser://")) {
      fileName = fileName.replace("browser:/","browserFS ");

      OpenForum.Storage.set(fileName,data);
      if( isUndefined(OpenForum.inq) == false ) OpenForum.inq.send( { type: "browserFS", event: "fileChanged", fileName: fileName } );

      var simpleFileName = fileName.substring( fileName.lastIndexOf("/")+1 );
      var extension = simpleFileName.substring( simpleFileName.lastIndexOf(".")+1 );

      OpenForum.findBrowserFileTreeNode( fileName, { type: "file", size: data.length, created: new Date().getTime(), updated: new Date().getTime(), fileName: simpleFileName, extension: extension } );

      var response = {"result":"ok","message":"Saved " + fileName,"saved":true};
      if(callBack) {
        callBack( response );
      } else {
        return response;
      }
    } else {
      return OpenForum.remoteSave(fileName,data,callBack);
    }
  };

  OpenForum.remoteDelete = OpenForum.deleteFile;
  OpenForum.deleteFile = function(pageName,fileName,callBack) {
    if(fileName.startsWith("browser://")) {
      fileName = fileName.replace("browser:/","browserFS ");

      OpenForum.findBrowserFileTreeNode( fileName, { deleted: true } );

      if( isUndefined(OpenForum.inq) == false ) OpenForum.inq.send( { type: "browserFS", event: "fileDeleted", fileName: fileName } );

      var response = {"result":"ok","message":"Deleted " + fileName,"deleted":true};
      if(callBack) {
        callBack( response );
      } else {
        return response;
      }
    } else {
      return OpenForum.remoteDelete(pageName,fileName,callBack);
    }
  };

  OpenForum.remoteLoad = OpenForum.loadFile;
  OpenForum.loadFile = function(fileName,callBack,noCache) {
    if(fileName.startsWith("browser://")) {
      fileName = fileName.replace("browser:/","browserFS ");

      var data = OpenForum.Storage.get(fileName);

      if(callBack) {
        callBack( data );
      }

      return data;
    } else {
      return OpenForum.remoteLoad(fileName,callBack,noCache);
    }
  };

  OpenForum.remoteAppend = OpenForum.appendFile;
  OpenForum.appendFile = function(fileName,data,callBack) {
    if(fileName.startsWith("browser://")) {
      fileName = fileName.replace("browser:/","browserFS ");

      var currentData = OpenForum.Storage.get(fileName);

      if( currentData == null ) {
        return OpenForum.saveFile(fileName,data,callBack);
      }

      data = currentData + data;
      OpenForum.Storage.set(fileName,data);
      if( isUndefined(OpenForum.inq) == false ) OpenForum.inq.send( { type: "browserFS", event: "fileChanged", fileName: fileName } );

      OpenForum.findBrowserFileTreeNode( fileName, { modified: new Date().getTime(), size: data.length } );

      var response = {"result":"ok","message":"Appended " + fileName,"appended":true};
      if(callBack) {
        callBack( response );
      } else {
        return response;
      }
    } else {
      return OpenForum.remoteAppend(fileName,data,callBack);
    }
  };

  OpenForum.remoteCopy = OpenForum.copyFile;
  OpenForum.copyFile = function(fileName,toFileName,callBack) {
    if(fileName.startsWith("browser://")) {
      fileName = fileName.replace("browser:/","browserFS ");

      var data = OpenForum.Storage.get(fileName);
      OpenForum.saveFile(toFileName,data);

      var response = {"result":"ok","message":"Copied " + fileName,"copied":true};
      if(callBack) {
        callBack( response );
      } else {
        return response;
      }
    } else {
      return OpenForum.remoteCopy(fileName,toFileName,callBack);
    }
  };

  OpenForum.remoteMove = OpenForum.moveFile;
  OpenForum.moveFile = function(fileName,toFileName,callBack) {
    if(fileName.startsWith("browser://")) {
      fileName = fileName.replace("browser:/","browserFS ");

      var data = OpenForum.Storage.get(fileName);
      OpenForum.saveFile(toFileName,data);
      OpenForum.deleteFile(fileName);

      var response = {"result":"ok","message":"Moved " + fileName,"moved":true};
      if(callBack) {
        callBack( response );
      } else {
        return response;
      }
    } else {
      return OpenForum.remoteMove(fileName,toFileName,callBack);
    }
  };

  OpenForum.remoteFileExists = OpenForum.fileExists;
  OpenForum.fileExists = function(fileName) {
    if(fileName.startsWith("browser://")) {
      fileName = fileName.replace("browser:/","browserFS ");

      return OpenForum.Storage.get(fileName) != null;

    } else {
      return OpenForum.remoteFileExists(fileName);
    }
  };

  OpenForum.remoteGetAttachments = OpenForum.getAttachments;
  OpenForum.getAttachments = function(pageName,callBack,matching,withMetaData) {
    if(pageName.startsWith("browser://")) {
      pageName = pageName.replace("browser:/","browserFS ");

      var list = OpenForum.Storage.find(pageName+"*.");
      var json = {
        attachments: [],
        length: 0,
        pageName: pageName
      };
      if(withMetaData) {
        json.size = 0;
      }

      for(var a in list) {
        var fileName = list[a].key.substring( pageName.length+1 );
        if(fileName.indexOf("/")!=-1) continue;

        var attachment = {
          pageName: pageName,
          fileName: fileName
        };

        if(withMetaData) {
          attachment.size = list[a].value.length;
          attachment.lastModified = 0;

          json.size += attachment.size;
        }

        json.length ++;

        json.attachments.push( attachment );
      }

      if(callBack) {
        callBack( json.attachments);
      } else {
        return json.attachments;
      }
    } else {
      return OpenForum.remoteGetAttachments(pageName,callBack,matching,withMetaData);
    }
  };

  OpenForum.remoteGetSubPages = OpenForum.getSubPages;
  OpenForum.getSubPages = function(pageName, callBack) {
    if(pageName.startsWith("browser://")) {
      pageName = pageName.replace("browser:/","browserFS ");

      var list = OpenForum.Storage.find(pageName+"*.");
      var json = [];
      var found = {};

      for(var a in list) {
        var fileName = list[a].key.substring( pageName.length );
        if(fileName.indexOf("/")!=-1) {
          dataPageName = fileName.substring( 0, fileName.indexOf("/") );
          if(typeof found[dataPageName] == "undefined") {
            json.push(dataPageName);
            found[dataPageName] = true;
          }
        }
      }

      if(callBack) {
        callBack( json );
      } else {
        return json;
      }
    } else {
      return OpenForum.remoteGetSubPages(pageName,callBack);
    }
  };

  OpenForum.remoteCreateFileTree = OpenForum.createFileTree;
  OpenForum.createFileTree = function(id,root,fileExtension,modifier) {
    if(root.startsWith("browser://")) {

      var tree = new Tree(id,"Loading...","",modifier);

      var fsJson = OpenForum.findBrowserFileTreeNode( root.replace("browser:/","") );
      //Copy
      //https://open-forum.onestonesoup.org/OpenForum/Javascript/Tree?action=getPageTree&pageName=/TheLab/Experiments/BrowserFileStorage

      var toFileTree = function( depth, name, json, path ) {
        if( isUndefined( path ) ) {
          path = "";
        }
        var newNode = {};
        newNode.name = name;
        newNode.attributes = {
          type: "page",
          pageName: path,
          link: path,
          icon: "book",
          toolTip: "Open page"
        };
        newNode.leaves = [];

        for(var i in json) {
          var node = json[i];

          if(node.type && node.type == "file") {
            if( ( typeof fileExtension != "undefined" ) && node.extension.match( ".*\." + fileExtension ) ) {
              continue;
            }
            var jsonNode = {};
            jsonNode.name = node.fileName;
            jsonNode.leaves = [];
            jsonNode.attributes = {
              type: "file",
              pageName: path,
              fileName: node.fileName,
              link: path + "/" +node.fileName,
              icon: "attach",
              actions: [
                {
                  fn: "function(node){ window.open('/OpenForum/Editor?pageName=' + node.getAttribute('pageName') + '&fileName=' + node.getAttribute('fileName')); }",
                  icon: "pencil",
                  toolTip: "Edit file"
                }
              ]
            };

            newNode.leaves.push( jsonNode );
          } else if(node.type && node.type == "page") {
            var fullPage = path;
            if( fullPage.endsWith("/") == false ) fullPage += "/";
            fullPage += node.fileName;

            var jsonNode = {};
            jsonNode.name = node.fileName;
            jsonNode.leaves = [];
            jsonNode.attributes = {
              type: "page",
              pageName: node.fileName,
              link: fullPage,
              icon: "page",
              toolTip: "Open page",
              depth: depth
            };

            var fsJson = OpenForum.findBrowserFileTreeNode( fullPage );
            newNode.leaves.push( toFileTree( depth+1, node.fileName, fsJson, fullPage ) );
          }
        }
        return newNode;
      };

      var jsonTree = toFileTree( 0,root.substring( root.lastIndexOf("/")+1 ) ,fsJson, root );

      tree.setJSON(jsonTree);
      tree.render();
      tree.getRoot().expand();
      tree.init();

      return tree;

    } else {
      return OpenForum.remoteCreateFileTree(id,root,fileExtension,modifier);
    }
  };  
};

OpenForum.addInitialiser( function() {
  //browserFS enabled by default. Add ?browserFS=false to stop
  if( OpenForum.getParameter("browserFS")=="false" == false ) {
    OpenForum.Browser.enableBrowserStorage();
  }
});
