/*
* Author: 
* Description: 
*/
Giraffe.addSnapToGrid = function(view,cellWidth,cellHeight) {
  Giraffe.busy = false;

  var grid = new Composite(0,0);
  for(var x=0;x<canvas.width;x+=cellWidth) {
    grid.add(new Line(x,0,0,canvas.height));
  }

  for(var y=0;y<canvas.height;y+=cellHeight) {
    grid.add(new Line(0,y,canvas.width,0));
  }
  canvas.add(grid);

  grid.animate = function() {
    if(Giraffe.busy) return;
    for(var gi in view.parts) {
      var g = view.parts[gi];
      if(g===this) continue;

      g.x = Math.round(g.x/cellWidth)*cellWidth;
      g.y = Math.round(g.y/cellHeight)*cellHeight;
    }
  };
};