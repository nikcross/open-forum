OpenForum.includeScript("/OpenForum/Giraffe/giraffe.js");
OpenForum.includeScript("/TheLab/Giraffe/RenSMARTPower/PowerGraph.object.js");

var canvas;

OpenForum.init = function() {
  canvas = new Canvas("canvas");
  Giraffe.Interactive.setInteractive(canvas);
  Giraffe.setAnimated(canvas);
  canvas.startAnimation(15,100,true);

  graph = new PowerGraph(50,10).setSize(500,300);
  canvas.add(graph);
};
