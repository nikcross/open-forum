OpenForum.includeScript("/OpenForum/Giraffe/giraffe.js");

var version;
var buildDate;
var size;
var lines;

OpenForum.init = function() {
  version = Giraffe.getVersion();
  buildDate = Giraffe.getBuildDate();
  OpenForum.loadFile("/OpenForum/Giraffe/giraffe.js",
                    function(data) {
    					size = Math.ceil(data.length/100)/10;
    					lines = data.split("\n").length;
  });
};