OpenForum.includeScript("/OpenForum/Javascript/Page/Data.js");

var rawData = "none";
var data;
var editor = "default";

OpenForum.init = function() {
  data = new Data().getData(pageName);
  rawData = data.getRawData();
  
  if(data.getEditor()) {
    editor = data.getEditor();
  }
};