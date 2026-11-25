Giraffe.addSnapToGrid = function(canvas) {
  var grid = new Composite(0,0);
  for(var x=0;x<canvas.width;x+=20) {
    grid.add(new Line(x,0,0,canvas.height));
  }

  for(var y=0;y<canvas.height;y+=20) {
    grid.add(new Line(0,y,canvas.width,0));
  }
  canvas.add(grid);
  canvas.grid = grid;

  grid.animate = function() {
    for(var gi in canvas.graphicsObjects) {
      var g = canvas.graphicsObjects[gi];
      if(g===this) continue;

      g.x = Math.round(g.x/20)*20;
      g.y = Math.round(g.y/20)*20;
    }
  };
};