OpenForum.includeScript("/OpenForum/Giraffe/giraffe.js");
OpenForum.includeScript("/OpenForum/Giraffe/SplineEditor/SplineEditor.js");
OpenForum.includeScript("/OpenForum/Giraffe/SnapToGrid/snap-to-grid.js");

OpenForum.init = function() {
  var htmlCanvas = document.getElementById("canvas");
  canvas = new Canvas("canvas");

  Giraffe.Interactive.setInteractive(canvas);
  Giraffe.setAnimated(canvas);
  canvas.startAnimation(20,100,true);

  splineEditor = new SplineEditor(700,420,canvas,canvas.canvasElement);
  Giraffe.addSnapToGrid(splineEditor.getView(),40,40);
  canvas.add( splineEditor.getView() );
};
