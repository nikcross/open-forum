example = { run: function() {
//START
canvas.add( new Rectangle(0,0,500,350).setFillColor("black").setColor("red") );

info = new Text(20,20,"Info",20).setFillColor("black");
leftButton = new Rectangle(0,350,250,150).setFillColor("black").setColor("red");
rightButton = new Rectangle(250,350,250,150).setFillColor("black").setColor("red");

bowl = new Circle(250,230,200).setColor("white").setFillColor(
  new RadialColor(canvas,"black","grey",0,0,250).getColor()
)
trackBall = new Circle(250,230,180).setColor("black").setFillColor(
  new RadialColor(canvas,"white","red",100,-100,150).getColor()
)

positionBall = new Circle(250,230,20).setColor("red").setFillColor(
  new RadialColor(canvas,"white","red",10,-10,20).getColor()
)

leftButton.onMousePressed = function() {
  leftButton.setFillColor("red");
}
leftButton.onMouseReleased = function() {
  leftButton.setFillColor("black");
}
rightButton.onMousePressed = function() {
  rightButton.setFillColor("red");
}
rightButton.onMouseReleased = function() {
  rightButton.setFillColor("black");
}
trackBall.onMouseOver = function(x,y) {
  info.text="moved to "+(x-250)+","+(y-230);
  positionBall.x=x;
  positionBall.y=y;
}

canvas.add( info );
canvas.add( leftButton );
canvas.add( rightButton );

canvas.add( bowl );
canvas.add( trackBall );
canvas.add( positionBall );
//END
}}

exampleLoaded();