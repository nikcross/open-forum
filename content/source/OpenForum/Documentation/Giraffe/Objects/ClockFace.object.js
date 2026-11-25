function ClockFace(x,y) {
	this.x = x;
	this.y = y;
	
	shadow = 'rgba(0,0,0,0.5)';
	
	background =  new Rectangle(0,0,400,400);
	background.fillColor="white";
	
	faceShadow = new Circle(201,201,150);
	faceShadow.color = shadow;
	face = new Circle(200,200,150);
	face.fillColor = "yellow";
	
	this.add( background );
	this.add( faceShadow );
	this.add( face );
	
	RADS=2*Math.PI;
	ticks=60;
	majorTicks=12;
	majorValue=12;
	outerValue = ["","","","","","","","","","","","","","","","",""];
	
	for(t=0;t<ticks;t++) {
	
	  i=(RADS*t)/ticks;
	
	  tick = new Composite(201,201,0);
	  line = new Line(0,-150,0,5);
	  line.color=shadow;
	  tick.add( line );
	  tick.rotation=i;
	  this.add( tick );
	
	  tick = new Composite(200,200,0);
	  line = new Line(0,-150,0,5);
	  tick.add( line);
	  tick.rotation=i;
	  this.add( tick );
	}
	
	for(t=1;t<=majorTicks;t++) {
	
	  i=(RADS*t)/majorTicks;
	
	  tick = new Composite(201,201,0);
	  line = new Line(0,-150,0,15);
	  line.color=shadow;
	  tick.add( line );
	  tick.rotation=i;
	  this.add( tick );
	
	  tick = new Composite(200,200,0);
	  line = new Line(0,-150,0,15);
	
	  value=Math.round((majorValue/majorTicks)*t)
	  text = new Text(-10,-115,""+value,15,"Arial");
	  text2 = new Text(-10,-160,outerValue[t],15,"Arial");
	  tick.add( line );
	  tick.add( text );
	  tick.add( text2 );
	  tick.rotation=i;
	  this.add( tick );
	}
}
ClockFace.prototype = new Composite();