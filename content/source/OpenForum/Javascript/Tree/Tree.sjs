function Tree() {
  var self = this;
  var createLeaves = function(pageName) {
    var data = [];

    try{
      var list = file.getAttachmentsForPage( pageName );
      var iterator= list.keySet().iterator();
      var keys = [];
      while(iterator.hasNext()) {
        keys.push( ""+iterator.next() );
      }
      keys.sort();

      for(var i in keys) {
        var key = keys[i];
        if(key.charAt(0)=='+') {
          continue;
        }
        data.push( createFileLeaf( pageName, key ) );
      }

      for(var i in keys) {
        var key = keys[i];

        if(key.charAt(0)!='+' || key=="+history") {
          continue;
        } else if(key.indexOf("\"")!=-1 || key.indexOf("'")!=-1) {
          continue;
        } else {

          var item = key.substring(1);
          data.push( createPageLeaf( pageName + "/" + item ) );
        }
      }
    } catch (e) { }
    return data; 
  };

  var createFileLeaf = function(pageName,fileName) {
    pageName = pageName.replace(/\/\//g,"/");
    var name = fileName;
    var extension = fileName.substring(fileName.lastIndexOf("."));

    var data = {
      name: name,
      attributes: { 
        type: "file",
        pageName: pageName,
        fileName: fileName,
        link: pageName+"/"+fileName,
        icon: "attach",
        actions: []
      },
      leaves: []
    };


    if(extension===".link") {
      data.attributes.actions.push( {fn: "function(node){ window.open('/OpenForum/Actions/ForkLink?pageName=' + node.getAttribute('pageName') + '&fileName=' + node.getAttribute('fileName')); }",
                                     icon: "arrow_divide",
                                     toolTip: "Fork linked file"} );
    } else {
      data.attributes.actions.push( {fn: "function(node){ window.open('/OpenForum/Editor?pageName=' + node.getAttribute('pageName') + '&fileName=' + node.getAttribute('fileName')); }",
                                     icon: "pencil",
                                     toolTip: "Edit file"} );
    }

    return data;
  };

  var createPageLeaf = function(pageName) {
    pageName = pageName.replace(/\/\//g,"/");
    var name = pageName;
    if(name.indexOf("/")!=-1) {
      name = name.substring(name.lastIndexOf("/")+1);
    }

    var data = {
      name: name,
      attributes: { 
        type: "page",
        pageName: pageName,
        link: pageName,
        icon: "page",
        toolTip: "Open page",
        actions: [] 
      },
      leaves:[]
    };

    data.leaves = createLeaves( pageName );
    
    data.attributes.actions.push( { fn: "function(node){ window.open('/OpenForum/Editor?pageName='+node.getAttribute('pageName')); }", icon: "layout_edit", toolTip: "Edit page"} );
    data.attributes.actions.push( { fn: "function(node){ window.open('/OpenForum/Actions/Delete?pageName='+node.getAttribute('pageName')); }", icon: "cancel", toolTip: "Delete page"} );

    return data;
  };

  self.createFileTree = function(pageName) {
    pageName = pageName.replace(/\/\//g,"/");
    var name = pageName;
    if(name.indexOf("/")!=-1) {
      name = name.substring(name.lastIndexOf("/")+1);
    }

    var data = {
      name: name,
      attributes: {
        type: "page",
        pageName: pageName,
        link: pageName,
        icon: "page",
        toolTip: "Open page"
      },
      leaves: []
    };
    data.leaves = createLeaves( pageName );
    return data;
  };
}