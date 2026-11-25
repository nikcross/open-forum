example = { run: function() {
//START
circle =  new Circle(100,100,10).setFillColor("blue");
canvas.add(circle);

sequence1 = new Giraffe.MoveSequence(circle,25,[0,2]);
sequence2 = new Giraffe.MoveSequence(circle,10,[2,0]);
sequence3 = new Giraffe.MoveSequence(circle,20,[0,-1]);
sequence4 = new Giraffe.MoveSequence(circle,30,[-2,0]);

sequence1.doNext = function() {
  sequence2.start();
}
sequence2.doNext = function() {
  sequence3.start();
}
sequence3.doNext = function() {
  sequence4.start();
}
sequence4.doNext = function() {
  sequence1.start();
}

sequence1.start();

thing = new Composite(100,100,0);
thing.add( new Rectangle(-10,-10,20,20).setFillColor("green"));
thing.add( new Circle(-10,-10,10).setColor("red"));
thing.add( new Circle(10,-10,10).setColor("red"));
thing.add( new Circle(-10,10,10).setColor("red"));
thing.add( new Circle(10,10,10).setColor("red"));

canvas.add(thing);


rotate = new Giraffe.RotationSequence(thing,100,2);
explode = new Giraffe.ExplodeSequence(thing,500);

rotate.doNext = function() {
  explode.start();
}
explode.doNext = function() {
  thing.visible=false;
}

rotate.start();

//END
}}

exampleLoaded();