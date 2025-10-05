function Data(pageName) {
  var self = this;
  var data = {};
  var rawData = null;

  self.setPageName = function(newPageName) {
    pageName = newPageName;
    if(pageName.charAt(0)!=="/") pageName = "/"+pageName;
    self.load();
    return this;
  };

  self.getEditor = function() {
    return self.find("editor");
  };
  
  self.getEditorConfig = function() {
    return self.find("editorConfig");
  };
  
  self.load = function() {

    try{
      if(typeof(OpenForum)!=="undefined") {
        rawData = OpenForum.loadFile(pageName+"/data.json");
      } else {
        rawData = file.getAttachment(pageName,"data.json");
      }
      data = JSON.parse(rawData);
    } catch(e) {}
  };
  
  self.save = function() {
    rawData = JSON.stringify( data,null,4 );
    
      if(typeof(OpenForum)!=="undefined") {
        rawData = OpenForum.saveFile("/"+pageName+"/data.json",rawData);
      } else {
        rawData = file.saveAttachment("/"+pageName,"data.json",rawData);
      }
  };

  if(pageName) {
    self.load();
  }

  //eg. service.get.attribute.1
  self.find = function(path) {
    if(typeof(data)=="undefined" || data==null) return;
    var parts = path.split(".");
    var found = data;
    for(var i=0;i<parts.length;i++) {
      found = found[parts[i]];
      if( typeof(found)=="undefined" ) {
        break;
      }
    }
    return found;
  };

  self.findParent = function (path) {
    var parts = path.split(".");
    var found = data;
    for(var i=0;i<parts.length-1;i++) {
      found = found[parts[i]];
      if( typeof(found)=="undefined" ) {
        break;
      }
    }
    return found;
  };

  var getNodeName = function(path) {
    var parts = path.split(".");
    return parts[parts.length-1];
  };

  var createPath = function(path) {
    var parts = path.split(".");
    var found = data;
    var lastFound = data;
    for(var i=0;i<parts.length-1;i++) {
      found = lastFound[parts[i]];
      if( typeof(found)=="undefined" ) {
        lastFound[parts[i]] = {};
        found = lastFound[parts[i]];
      }
      lastFound = found;
    }
    return lastFound;
  };

  // mode = insert, update, upsert
  self.set = function(path,value,mode) {
    if(!mode) {
      mode = "upsert";
    }

    var node = self.find(path);
    var target = self.findParent(path);
    var name = getNodeName(path);

    if(mode==="insert" && !node) {
      target = createPath(path);
      target[name] = value;
    } else if(mode==="update" && node) {
      target[name] = value;
    } else if(mode==="upsert") {
      if(!target) {
        target = createPath(path);
      }
      target.name = value;
    }
  };

  self.getRawData = function() {
    return rawData;
  };
}