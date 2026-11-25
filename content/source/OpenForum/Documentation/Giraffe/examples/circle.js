example = { run: function() {
//START
canvas.add(
new Circle(50,50,10).setFillColor("red")
);

canvas.add(
new Circle(80,80,25).setFillColor("green").setShadow(new Shadow())
);

canvas.add(
new Circle(150,150,50).setFillColor("blue")
);
//END
}}

exampleLoaded();