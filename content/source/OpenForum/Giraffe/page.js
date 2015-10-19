OpenForum.loadScript("/OpenForum/Giraffe/giraffe.js");

var giraffe = {canvas: null};

OpenForum.init = function() {
          giraffe.canvas = new Canvas("exampleCanvas");
          Giraffe.Interactive.setInteractive(giraffe.canvas);
          Giraffe.setAnimated(giraffe.canvas);
          giraffe.canvas.startAnimation(20,100,true);
  
          OpenForum.loadScript("/OpenForum/Giraffe/example.js");
};