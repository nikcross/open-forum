example = { run: function() {
//START
circle =  new Circle(100,100,50).setFillColor("blue");
canvas.add(circle);

circle.sequence=new Giraffe.MoveSequence(circle,100,[1,1]);
circle.sequence.doNext = function() {
	circle.sequence.start();
}
circle.sequence.start();

canvas.add(circle);
//END
}}

exampleLoaded();
