example = { run: function() {
//START
draggableLine = {};
dl = draggableLine;
dl.p1 = new Circle(100,80,5).setFillColor("rgba(0,0,255,0.5)").setColor("rgba(0,0,255,0.5)");
dl.p2 = new Circle(100,150,5).setFillColor("rgba(0,0,255,0.5)").setColor("rgba(0,0,255,0.5)");
dl.line = new Line(100,80,0,70); 
canvas.add(dl.p1);
canvas.add(dl.p2);
canvas.add(dl.line);
dl.p1.onMouseOver = function() {
  dl.p1.visible=true;
}
dl.p1.onMouseOut = function() {
  dl.p1.visible=false;
}
dl.p2.onMouseOver = function() {
  dl.p1.visible=true;
}
dl.p2.onMouseOut = function() {
  dl.p1.visible=false;
}
dl.processFrame = function() {
  dl.line.x = dl.p1.x;
  dl.line.y = dl.p1.y;
  dl.line.x2 = dl.p2.x-dl.p1.x;
  dl.line.y2 = dl.p2.y-dl.p1.y;
}

canvas.makeDraggable(dl.p1);
canvas.makeDraggable(dl.p2);
canvas.addAnimationListener(dl);
//END
}}

exampleLoaded();