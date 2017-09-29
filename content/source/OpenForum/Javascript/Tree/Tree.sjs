function Tree() {
  var self = this;
  var MAX_FILES = 10;
  var MAX_PAGES = 10;
  var MAX_DEPTH = 1;

  var createLeaves = function(pageName,matcher,fileOffset,pageOffset,depth) {
    var data = [];
    if(!depth) {
      depth = 0;
    }

    try{
      var list = file.getAttachmentsForPage( pageName );
      var iterator= list.keySet().iterator();
      var keys = [];
      while(iterator.hasNext()) {
        keys.push( ""+iterator.next() );
      }
      keys.sort();

      var fileLeafCount = 0;
      for(var i in keys) {
        var key = keys[i];
        if(key.charAt(0)=='+') {
          continue;
        } else if(key.match(matcher)==null) {
          continue;
        } else if(fileLeafCount<fileOffset || pageOffset!=0) {
          fileLeafCount++;
          continue;
        }
        data.push( createFileLeaf( pageName, key ) );
        fileLeafCount++;
        if((fileLeafCount-fileOffset)>MAX_FILES) {
          data.push( createMoreFilesLeaf( pageName, matcher, fileLeafCount ) );
          break;
        }
      }

      var pageLeafCount = 0;
      for(var i in keys) {
        if(pageLeafCount<=pageOffset) {
          pageLeafCount++;
          continue;
        }
        var key = keys[i];

        /*if(depth>MAX_DEPTH) {
          data.push( createDeeperPagesLeaf( pageName, matcher ) );
          return data;
        }*/
        
        if(key.charAt(0)!='+' || key=="+history") {
          continue;
        } else if(key.indexOf("\"")!=-1 || key.indexOf("'")!=-1) {
          continue;
        } else if(key.match(matcher)==false) {
          continue;
        } else if(pageLeafCount<pageOffset || fileOffset!=0) {
          pageLeafCount++;
          continue;
        } else {

          var item = key.substring(1);
          data.push( createPageLeaf( pageName + "/" + item, matcher, depth ) );
          pageLeafCount++;
          if((pageLeafCount-pageOffset)>MAX_PAGES) {
            data.push( createMorePagesLeaf( pageName, matcher, pageLeafCount ) );
            break;
          }
        }
      }
    } catch (e) { }
    return data; 
  };

  var createMorePagesLeaf = function(pageName,match, offset) {
    pageName = pageName.replace(/\/\//g,"/");
    var data = {
      name: "more...",
      attributes: { 
        type: "more",
        pageName: pageName,
        actions: []
      },
      leaves: []
    };
    
    data.attributes.actions.push( {fn: "function(node){ "+
                                     "node.getParent().importJSON( '/OpenForum/Javascript/Tree','getPageTree','pageName=' + node.getAttribute('pageName') + '&match="+match+"&fileOffset=0&pageOffset="+offset+"' );"+
                                     "node.getParent().deleteChild(node);"+
                                    "}",
                                     icon: "add",
                                     toolTip: "Show more files"} );

    return data;
  };   
  
  var createMoreFilesLeaf = function(pageName,match, offset) {
    pageName = pageName.replace(/\/\//g,"/");
    var data = {
      name: "more...",
      attributes: { 
        type: "more",
        pageName: pageName,
        actions: []
      },
      leaves: []
    };
    
    data.attributes.actions.push( {fn: "function(node){ "+
                                     "node.getParent().importJSON( '/OpenForum/Javascript/Tree','getPageTree','pageName=' + node.getAttribute('pageName') + '&match="+match+"&fileOffset="+offset+"&pageOffset=0' );"+
                                     "node.getParent().deleteChild(node);"+
                                    "}",
                                     icon: "add",
                                     toolTip: "Show more files"} );

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

  var createPageLeaf = function(pageName,matcher,depth) {
    if(!depth) depth = 0;
    
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
        actions: [],
        depth: depth
      },
      leaves:[]
    };

    if(pageName.indexOf("#pages.more")!=-1) {
      data.attributes.actions.push( { fn: "alert", icon: "add", toolTip: "Show more pages"} );
    } else {

      var newDepth = depth+1;
      data.leaves = createLeaves( pageName,matcher,0,0,newDepth );

      data.attributes.actions.push( { fn: "function(node){ window.open('/OpenForum/Editor?pageName='+node.getAttribute('pageName')); }", icon: "layout_edit", toolTip: "Edit page"} );
      data.attributes.actions.push( { fn: "function(node){ window.open('/OpenForum/Actions/Delete?pageName='+node.getAttribute('pageName')); }", icon: "cancel", toolTip: "Delete page"} );
    }

    return data;
  };

  self.createFileTree = function(pageName,matcher,fileOffset,pageOffset) {
    if(!matcher || matcher==null) matcher = ".*";
    
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
    data.leaves = createLeaves( pageName,matcher,fileOffset,pageOffset );
    return data;
  };
}