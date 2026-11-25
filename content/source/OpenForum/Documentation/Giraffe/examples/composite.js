example = { run: function() {
//START
composite = new Composite(100,100,0);
composite.add( new Circle(-20,-20,10).setFillColor("green") );
composite.add( new Circle(20,-20,10).setFillColor("red") );
composite.add( new Circle(0,20,15).setFillColor("blue") );

canvas.add( composite );
//END
}}

exampleLoaded();