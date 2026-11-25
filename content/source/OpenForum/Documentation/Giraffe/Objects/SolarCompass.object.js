function SolarCompass(x,y) {
  this.x=x;
  this.y=y;

radius = 150;
centerX = 200;
centerY = 200;

this.add( new Circle(centerX ,centerY ,radius+50).setFillColor("black") );
this.add( new Circle(centerX ,centerY ,radius+40).setFillColor("white") );
this.add( new Circle(centerX ,centerY ,radius+20).setFillColor("gray") );

dial=new Composite(centerX,centerY);
dial.add( new Arc(0,0,45,90,radius+20).setFillColor("green") );
dial.add( new Arc(0,0,45,90,radius-30).setFillColor("lightgreen") );
dial.add( new Arc(0,0,45,90,radius-60).setFillColor("green") );
dial.add( new Arc(0,0,135,45,radius+20).setFillColor("orange") );
dial.add( new Arc(0,0,135,45,radius-30).setFillColor("yellow") );
dial.add( new Arc(0,0,135,45,radius-60).setFillColor("orange") );
dial.add( new Arc(0,0,0,45,radius+20).setFillColor("orange") );
dial.add( new Arc(0,0,0,45,radius-30).setFillColor("yellow") );
dial.add( new Arc(0,0,0,45,radius-60).setFillColor("orange") );

//===================
shadow = 'rgba(0,0,0,0.5)';
RADS=2*Math.PI;
ticks=360/5;
majorTicks=16;
majorValue=360;
outerValue = ["NORTH","NE","ENE","E","SE","ESE","SE","SSE","SOUTH","SSW","SW","WSW","W","WNW","NW","NNW","NORTH"];

for(t=0;t<ticks;t++) {

  i=(RADS*t)/ticks;

  tick = new Composite(1,1,0);
  line = new Line(0,-radius-20,0,5);
  line.color=shadow;
  tick.add( line );
  tick.rotation=i;
  dial.add( tick );

  tick = new Composite(0,0,0);
  line = new Line(0,-radius-20,0,5);
  tick.add( line);
  tick.rotation=i;
  dial.add( tick );
}

for(t=0;t<majorTicks;t++) {

  i=(RADS*t)/majorTicks;

  tick = new Composite(1,1,0);
  line = new Line(0,-radius-20,0,15);
  line.color=shadow;
  tick.add( line );
  tick.rotation=i;
  dial.add( tick );

  tick = new Composite(0,0,0);
  line = new Line(0,-radius-20,0,15);

  value=Math.round((majorValue/majorTicks)*t)
  text = new Text(-10,-radius+8,""+value,10);
  text2 = new Text(-10,-radius-24,outerValue[t],10);
  tick.add( line );
  tick.add( text );
  tick.add( text2 );
  tick.rotation=i;
  dial.add( tick );
}

//===================

dial.rotation=45*Math.PI/180;

this.add(dial);

this.add( new Rectangle(centerX-10,centerY,20,-radius-50).setFillColor("rgba(0,0,255,0.5)").setColor("rgba(0,0,255,0.5)") );
this.add( new Rectangle(centerX-10,centerY-50,20,-20).setFillColor("rgba(0,255,255,0.5)").setColor("rgba(0,255,255,0.5)") );

this.add( new Circle(centerX,centerY,10).setFillColor("black") );
}
SolarCompass.prototype = new Composite();