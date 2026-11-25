//OpenForum.includeScript("/OpenForum/Javascript/OpenForumServer/File/File.js");

var version;
var buildDate;
var size;
var lines;

OpenForum.init = function() {
  
  version = OpenForum.getVersion();
  buildDate = OpenForum.getBuildDate();
  OpenForum.loadFile("/OpenForum/Javascript/open-forum.js",
                    function(data) {
    					size = Math.ceil(data.length/100)/10;
    					lines = data.split("\n").length;
  });
};