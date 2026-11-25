example = { run: function() {
//START
canvas.add(
new Text(50,50,"Sample Text",20).setColor("red")
);

canvas.add(
new Text(80,80,"Sample Text",30,"line").setColor("green")
);

canvas.add(
new Text(150,150,"Sample Text",40).setFillColor("blue")
);
//END
}}

exampleLoaded();