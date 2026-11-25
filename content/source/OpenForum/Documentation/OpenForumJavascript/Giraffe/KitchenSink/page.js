OpenForum.includeScript("/OpenForum/Giraffe/giraffe.js");

OpenForum.init = function() {
  canvas = new Canvas("exampleCanvas");
  Giraffe.Interactive.setInteractive(canvas);
  Giraffe.setAnimated(canvas);
  canvas.startAnimation(20,100,true);

  loadExample("/OpenForumJavascript/Giraffe/KitchenSink/examples/drag-and-drop");
};

function loadExample(examplePath) {
  canvas.graphicsObjects = [];

  var e = document.createElement("script");
  e.src = examplePath+".js?ts="+new Date().getTime();
  e.type="text/javascript";
  document.getElementsByTagName("head")[0].appendChild(e);
  return false;
}

function exampleLoaded() {

  scriptText = ""+example.run;
  scriptText = scriptText.substring( scriptText.indexOf("//START")+8,scriptText.indexOf("//END") );
  document.getElementById("exampleScript").value=scriptText;

  example.run();
}

