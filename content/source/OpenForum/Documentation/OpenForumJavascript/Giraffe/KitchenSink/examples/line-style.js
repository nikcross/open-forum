example = { run: function() {
//START
canvas.add(
new Line(50,50,60,80).setColor("red").setLineStyle( new LineStyle() )
);

canvas.add(
new Line(80,80,80,120).setColor("green").setLineStyle( new LineStyle().setThickness(10) )
);

canvas.add(
new Line(150,150,120,80).setColor("blue").setLineStyle( new LineStyle().setThickness(15).setEndCap("square") )
);
//END
}}

exampleLoaded();