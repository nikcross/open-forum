example = { run: function() {
//START
canvas.add(
new Arc(50,50,0,180,10).setFillColor("red")
);

canvas.add(
new Arc(80,80,0,90,25).setFillColor("green")
);

canvas.add(
new Arc(150,150,90,90,50).setFillColor("blue")
);
//END
}}

exampleLoaded();