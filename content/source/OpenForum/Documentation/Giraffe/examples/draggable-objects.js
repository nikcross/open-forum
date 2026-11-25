example = { run: function() {
//START
draggableLine = {};
dl = draggableLine;
dl.p1 = new Circle(100,80,5).
	setFillColor("rgba(0,0,255,0.5)").
	setColor("rgba(0,0,255,0.5)");
dl.p2 = new Circle(100,150,5).
	setFillColor("rgba(0,0,255,0.5)").
	setColor("rgba(0,0,255,0.5)");
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
  dl.p2.visible=true;
}
dl.p2.onMouseOut = function() {
  dl.p2.visible=false;
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

draggableCircle = {};
dc = draggableCircle;
dc.circle = new Circle(200,100,20).setFillColor("green");
dc.p1 = new Circle(200,130,5).
	setFillColor("rgba(0,0,255,0.5)").
	setColor("rgba(0,0,255,0.5)");
dc.circle.onMouseOver = function() {
  dc.p1.visible=true;
}
dc.circle.onMouseOut = function() {
  dc.p1.visible=false;
}
dc.p1.onMouseOver = function() {
  dc.p1.visible=true;
}
dc.p1.onMouseOut = function() {
  dc.p1.visible=false;
}

canvas.add(dc.p1);
canvas.add(dc.circle);

dc.processFrame = function() {
  if(dc.circle.dragging) {
    dc.p1.x = dc.circle.x+dc.circle.radius;
    dc.p1.y = dc.circle.y;
  }
  if(dc.p1.dragging) {
  	dx = dc.p1.x-dc.circle.x;
	dy = dc.p1.y-dc.circle.y;
  	r = Math.pow((dx*dx)+(dy*dy),0.5);
  	dc.circle.radius = r;
  }
}

canvas.makeDraggable(dc.circle);
canvas.makeDraggable(dc.p1);
canvas.addAnimationListener(dc);

draggableRactengle = {};
dr = draggableRactengle;
dr.rectangle = new Rectangle(300,100,20,20).setFillColor("purple");
dr.p1 = new Circle(320,120,5).
	setFillColor("rgba(0,0,255,0.5)").
	setColor("rgba(0,0,255,0.5)");
dr.rectangle.onMouseOver = function() {
  dr.p1.visible=true;
}
dr.rectangle.onMouseOut = function() {
  dr.p1.visible=false;
}
dr.p1.onMouseOver = function() {
  dr.p1.visible=true;
}
dr.p1.onMouseOut = function() {
  dr.p1.visible=false;
}

canvas.add(dr.p1);
canvas.add(dr.rectangle);

dr.processFrame = function() {
  if(dr.rectangle.dragging) {
    dr.p1.x = dr.rectangle.x+dr.rectangle.width;
    dr.p1.y = dr.rectangle.y+dr.rectangle.height;
  }
  if(dr.p1.dragging) {
  	dx = dr.p1.x-dr.rectangle.x;
	dy = dr.p1.y-dr.rectangle.y;
  	dr.rectangle.width=dx;
  	dr.rectangle.height=dy;
    
  }
}

canvas.makeDraggable(dr.rectangle);
canvas.makeDraggable(dr.p1);
canvas.addAnimationListener(dr);
//END
}}

exampleLoaded();
