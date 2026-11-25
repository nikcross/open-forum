/*
* Author: 
*/
OpenForum.includeScript("/OpenForum/Giraffe/giraffe.js");

OpenForum.init = function() {
  	canvas = new Canvas("canvas");
  	Giraffe.Interactive.setInteractive(canvas);
  	Giraffe.setAnimated(canvas);
	canvas.startAnimation(15,100,true);
	
	drawMousePad();
};


var shadow = new Shadow();
var mousePad;
var mouseBall;
var vx=0;
var vy=0;
var oldX=-1;
var oldY=-1;

function drawMousePad() {
	mousePad = new Composite(10,10);
	mousePad.add( new Rectangle(0,0,380,380).setFillColor("lightgreen").setColor("green") );
	canvas.add(mousePad);
	
	mouseBall = new Composite(200,200);
	mouseBall.add(new Circle(0,0,10).setFillColor("red"));
	mouseBall.vector = new Line(0,0,0,0).setColor("blue");
	mouseBall.add(mouseBall.vector);
	mouseBall.visible=false;
	canvas.add(mouseBall);
	
	mousePad.onMouseOver = function(x,y) {
		mouseBall.visible=true;
		
		if(oldX!=-1 && oldY!=-1) {
			vx=x-oldX;
			vy=y-oldY;
			mouseBall.vector.x2 = (vx*5);
			mouseBall.vector.y2 = (vy*5);
		}
		
		mouseBall.x=x;
		mouseBall.y=y;
		
		oldX=x;
		oldY=y;
	};
	
	mousePad.onMouseOut = function(x,y) {
		mouseBall.visible=false;
		
		oldX=-1;
		oldY=-1;
	};
	
	mouseButtonLeft = new Rectangle(10,400,180,50).setFillColor("lightGreen").setColor("green");
	mouseButtonRight = new Rectangle(210,400,180,50).setFillColor("lightGreen").setColor("green");
	
	mouseButtonLeft.onMousePressed= function(x,y) {
		mouseButtonLeft.setFillColor("green");
	};
	mouseButtonLeft.onMouseReleased = function(x,y) {
		mouseButtonLeft.setFillColor("lightgreen");
	};
	
	mouseButtonRight.onMousePressed= function(x,y) {
		mouseButtonRight.setFillColor("green");
	};
	mouseButtonRight.onMouseReleased = function(x,y) {
		mouseButtonRight.setFillColor("lightgreen");
	};
	
	canvas.add(mouseButtonLeft);
	canvas.add(mouseButtonRight);
}