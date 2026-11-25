example = { run: function() {
//START
	canvas.add(
new Circle(130,210,80).setColor("black").setFillColor( new GradientColor(canvas,"red","green",0,-80,0,80).getColor())
	);

//END
}}

exampleLoaded();