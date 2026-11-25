example = { run: function() {
//START
circle =  new Circle(100,100,50).setFillColor("blue");
canvas.add(circle);

flipOutX = new Giraffe.FlipOutX(circle,10);
flipInX = new Giraffe.FlipInX(circle,10);
flipOutY = new Giraffe.FlipOutY(circle,20);
flipInY = new Giraffe.FlipInY(circle,20);

flipOutX.doNext = function() {
  flipInX.start();
}
flipInX.doNext = function() {
  flipOutY.start();
}
flipOutY.doNext = function() {
  flipInY.start();
}
circle.flip = flipOutX;

circle.flip.start();

canvas.add(circle);
//END
}}

exampleLoaded();