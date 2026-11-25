example = { run: function() {
//START
shadow = new Circle(130,210,80).setColor("white").setFillColor(
  new RadialColor(canvas,"black","white",10,0,80).getColor()
)
shadow.scaleY=0.5;
canvas.add( shadow );

canvas.add(
new Circle(150,150,50).setColor("blue").setFillColor(
  new RadialColor(canvas,"white","blue",30,-20,50).getColor()
)
);

canvas.add(
new Circle(50,70,40).setColor("#000000").setFillColor("#A0A0A0")
);
canvas.add(
new Circle(50,50,30).setColor("black").setFillColor("rgba(0,255,0,0.5)")
);
canvas.add(
new Circle(70,70,30).setColor("black").setFillColor("rgba(255,0,0,0.5)")
);
canvas.add(
new Circle(30,70,30).setColor("black").setFillColor("rgba(0,0,255,0.5)")
);
//END
}}

exampleLoaded();