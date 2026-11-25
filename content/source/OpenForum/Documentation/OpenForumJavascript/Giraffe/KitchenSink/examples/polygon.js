example = { run: function() {
//START
polygon = new Polygon(50,50).setFillColor("red");
polygon.addPoint(0,0);
polygon.addPoint(50,0);
polygon.addPoint(50,50);
polygon.addPoint(0,50);
polygon.addPoint(-35,25);

canvas.add( polygon );
//END
}}

exampleLoaded();
