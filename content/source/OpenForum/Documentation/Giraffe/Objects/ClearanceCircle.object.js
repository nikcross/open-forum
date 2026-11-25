function ClearanceCircle(x,y,radius,startAngle,sweepAngle) {
  this.x=x;
  this.y=y;
  this.majorDash = 8;
  this.minorDash = 4;
  this.space = 6;
  this.startAngle=startAngle;
  this.sweepAngle=sweepAngle;
  this.radius=radius;

  this.parts = [];

  for(var i=this.space;i<this.sweepAngle;i+=(this.majorDash+this.minorDash+(this.space*2) )) {
    this.add( new Arc(0,0,i+this.startAngle ,this.majorDash ,this.radius ).setOpen() );
    this.add( new Arc(0,0,i+this.startAngle+this.majorDash+this.space ,this.minorDash ,this.radius ).setOpen() );
  }

  this.setColor = function(color) {
    for(var i=0;i<this.parts.length;i++) {
      this.parts[i].setColor(color);
    }
    return this;
  };
}
ClearanceCircle.prototype = new Composite();