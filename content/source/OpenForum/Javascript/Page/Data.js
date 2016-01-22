function Data() {
  var self = this;
  var pageName = null;
  var data = {};
  var rawData = null;
  
  self.getData = function(newPageName) {
    pageName = newPageName;
    
    if(typeof(OpenForum)!=="undefined") {
      rawData = OpenForum.loadFile("/"+pageName+"/data.json");
    } else {
      rawData = file.getAttachment("/"+pageName,"data.json");
    }
    data = JSON.parse(rawData);
    
    return self;
  };
  
  self.getRawData = function() {
    return rawData;
  };
  
  self.getEditor = function() {
    return data.editor;
  };
}