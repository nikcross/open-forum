/*
* Author: 
*/
OpenForum.includeScript("/OpenForum/Giraffe/giraffe.js");

OpenForum.includeScript("/TheLab/Giraffe/Objects/DashedLine.object.js");
OpenForum.includeScript("/TheLab/Giraffe/Objects/ClearanceCircle.object.js");
OpenForum.includeScript("/TheLab/Giraffe/Objects/Beaker.object.js");
OpenForum.includeScript("/TheLab/Giraffe/Objects/Clock.object.js");
OpenForum.includeScript("/TheLab/Giraffe/Objects/ClockFace.object.js");
OpenForum.includeScript("/TheLab/Giraffe/Objects/Cog.object.js");
OpenForum.includeScript("/TheLab/Giraffe/Objects/Compass.object.js");
OpenForum.includeScript("/TheLab/Giraffe/Objects/Door.object.js");
OpenForum.includeScript("/TheLab/Giraffe/Objects/GeneView.object.js");
OpenForum.includeScript("/TheLab/Giraffe/Objects/CompassFace.object.js");
OpenForum.includeScript("/TheLab/Giraffe/Objects/SolarCompass.object.js");
OpenForum.includeScript("/TheLab/Giraffe/Objects/Ladder.object.js");
OpenForum.includeScript("/TheLab/Giraffe/Objects/Thermometer.object.js");
OpenForum.includeScript("/TheLab/Giraffe/Objects/Dial.object.js");

var canvas;
OpenForum.init = function() {
	canvas = new Canvas("exampleCanvas");
  	Giraffe.Interactive.setInteractive(canvas);
  	Giraffe.setAnimated(canvas);
	canvas.startAnimation(20,100,true);
	
	dashedLine = new DashedLine(10,10,150,150);
	clearanceCircle = new ClearanceCircle(110,110,100,45,270);
	beaker = new Beaker(10,10);
	beaker.setLevel(50);
	clock = new Clock(10,10,"/TheLab/Giraffe/Objects/clock.png");
	clockFace = new ClockFace(10,10);
	cog = new Cog(10,10);
	compass = new Compass(10,10,"/TheLab/Giraffe/Objects/compass.png");
	door = new Door(100,300);
	geneView = new GeneView(10,10);
	compassFace = new CompassFace(10,10);
	solarCompass = new SolarCompass(10,10);
	ladder = new Ladder(100,300);
	thermometer = new Thermometer(10,10);
	dial = new Dial(10,10);
};

function showObject(objectName) {
	canvas.graphicsObjects = [];

	eval( "canvas.add( "+objectName+" );" );
	
	return false;
}