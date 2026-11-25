example = { run: function() {
//START
canvas.add(
new Picture(50,50,"examples/picture.png").setColor("red")
);

canvas.add(
new Picture(80,80,"picture.png").setColor("green")
);

canvas.add(
new Picture(150,150,"picture.png").setFillColor("blue")
);
//END
}}

exampleLoaded();