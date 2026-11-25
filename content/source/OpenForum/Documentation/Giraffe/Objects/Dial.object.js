function Dial(x,y) {
  this.x=x;
  this.y=y;

  radius = 150;
  centerX = 200;
  centerY = 200;
  sweepAnglePC = 0.8;

  this.add( new Circle(centerX ,centerY ,radius+50).setFillColor("gray") );
  this.add( new Circle(centerX ,centerY ,radius+40).setFillColor("white") );

  dial=new Composite(centerX,centerY);
  dial.add( new Arc(0,0,-10,30,radius+35).setFillColor("orange") );
  dial.add( new Arc(0,0,-10,30,radius+10).setFillColor("white")  );
  dial.add( new Arc(0,0,-10-1,30+2,radius+10-2).setFillColor("white").setColor("white")  );
  dial.add( new Arc(0,0,20,35,radius+35).setFillColor("red") );
  dial.add( new Arc(0,0,20,35,radius+10).setFillColor("white") );
  dial.add( new Arc(0,0,20-1,35+2,radius+10-2).setFillColor("white").setColor("white") );

  sweepAngle = 360*((1-sweepAnglePC));
  startAngle = 90-(sweepAngle/2);
  dial.add( new Arc(0,0,startAngle,sweepAngle,radius+40).setFillColor("gray").setOpen() );

  //===================
  shadow = 'rgba(0,0,0,0.5)';
  RADS=2*Math.PI*sweepAnglePC;
  OFFSET_RADS = (2*Math.PI*((1-sweepAnglePC)/2))+Math.PI;

  ticks=100;
  majorTicks=10;
  majorValue=100;
  outerValue = ["","","","","","","","","","","","","","","","",""];

  for(t=0;t<ticks;t++) {

    i=OFFSET_RADS+((RADS*t)/ticks);

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

  for(t=0;t<=majorTicks;t++) {

    i=OFFSET_RADS+((RADS*t)/majorTicks);

    tick = new Composite(1,1,0);
    line = new Line(0,-radius-20,0,15);
    line.color=shadow;
    tick.add( line );
    tick.rotation=i;
    dial.add( tick );

    tick = new Composite(0,0,0);
    line = new Line(0,-radius-20,0,15);

    value=Math.round((majorValue/majorTicks)*t);
    text = new Text(-10,-radius+8,""+value,10).setFillColor("black");
    text2 = new Text(-10,-radius-24,outerValue[t],10).setFillColor("black");
    tick.add( line );
    tick.add( text );
    tick.add( text2 );
    tick.rotation=i;
    dial.add( tick );
  }

  //===================

  this.add(dial);

  needle = new Polygon(centerX,centerY);
  needle.addPoint(-7,0);
  needle.addPoint(0,radius);
  needle.addPoint(7,0);
  needle.addPoint(0,-radius/4);
  needle.setFillColor("red");
  needle.rotation=1.6;

  this.add( needle );

  this.add( new Circle(centerX,centerY,12).setFillColor("gray") );
  this.add( new Text(centerX-40,centerY-40,"Level",25).setFillColor("black") );
  this.add( new Text(centerX-45,centerY+radius-10,"19.34",25).setFillColor("black") );
}
Dial.prototype = new Composite();