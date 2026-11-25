function CompassFace(x,y) {
	shadow = 'rgba(0,0,0,0.5)';
	
	background =  new Rectangle(0,0,400,400);
	background.fillColor="white";
	
	faceShadow = new Circle(201,201,150);
	faceShadow.color = shadow;
	
	this.add( background );
	this.add( faceShadow );
	
	RADS=2*Math.PI;
	ticks=360/5;
	majorTicks=16;
	majorValue=360;
	outerValue = ["NORTH","NE","ENE","E","SE","ESE","SE","SSE","SOUTH","SSW","SW","WSW","W","WNW","NW","NNW","NORTH"];
	
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
	
	for(t=0;t<majorTicks;t++) {
	
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
	  text = new Text(-10,-115,""+value,10);
	  text2 = new Text(-10,-160,outerValue[t],10);
	  tick.add( line );
	  tick.add( text );
	  tick.add( text2 );
	  tick.rotation=i;
	  this.add( tick );
	}
}
CompassFace.prototype = new Composite();