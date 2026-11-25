function DashedLine(x1,y1,x2,y2) {
  this.x=x1;
  this.y=y1;
  this.x2=x2;
  this.y2=y2;
  this.majorDash=10;
  this.minorDash=5;
  this.space=5;
  this.parts = new Array();

  this.init = function() {
  var lx = this.x2-this.x;
  var ly = this.y2-this.y;

  var length = Math.pow((lx*lx)+(ly*ly),0.5);
  var dashes= length/(this.majorDash+this.minorDash+(this.space*3));

  for(var i=0;i<dashes;i++) {
	  var px=i*(lx/dashes);
	  var py=i*(ly/dashes);
	  var dx=(this.majorDash/(this.majorDash+this.minorDash+this.space))
            *lx/dashes;
	  var dy=(this.majorDash/(this.majorDash+this.minorDash+this.space))
            *ly/dashes;

	  this.add( new Line(px,py,dx,dy) );

	  px+=dx+((this.space/(this.majorDash+this.minorDash+this.space))*(lx/dashes)/2);
	  py+=dy+((this.space/(this.majorDash+this.minorDash+this.space))*(ly/dashes)/2);

	  dx=(this.minorDash/(this.majorDash+this.minorDash+this.space))*lx/dashes;
	  dy=(this.minorDash/(this.majorDash+this.minorDash+this.space))*ly/dashes;

	  this.add( new Line(px,py,dx,dy) );
  }
 }
 
  this.init();

  this.setColor = function(color) {
    for(var i=0;i<this.parts.length;i++) {
      this.parts[i].setColor(color);
    }
    return this;
  }
}
DashedLine.prototype = new Composite();