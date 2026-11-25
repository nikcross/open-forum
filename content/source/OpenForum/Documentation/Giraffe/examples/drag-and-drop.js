example = { run: function() {
//START
dropTarget = new Circle(150,150,50).setFillColor("green");
draggable1 = new Circle(50,50,20).setFillColor("blue");
draggable2 = new Circle(150,50,20).setFillColor("purple");

draggable1.onMouseOver = function() {
  draggable1.setFillColor("red");
}
draggable1.onMouseOut = function() {
  draggable1.setFillColor("blue");
}
draggable2.onMouseOver = function() {
  draggable2.setFillColor("red");
}
draggable2.onMouseOut = function() {
  draggable2.setFillColor("purple");
}
draggable1.name="Blue Disc";
draggable2.name="Purple Disc";

canvas.makeDraggable(draggable1);
canvas.makeDraggable(draggable2);
dropTarget.onCatch = function(item) {
  alert("Touch Down "+item.name);
}

canvas.add( dropTarget );
canvas.add( draggable1 );
canvas.add( draggable2 );
//END
}}

exampleLoaded();