function Insulator(x,y,disks,length) {
  this.x=x;
  this.y=y;
  this.parts = new Array();
  this.disks=disks;
  this.length=length;
  
  this.init = function() {
    var dDisk = this.length/this.disks;
	for(var i=0;i<this.disks;i++) {
	  var p = new Polygon(0,i*dDisk);
	  p.color = this.color;
	  p.fillColor = this.fillColor;
	  p.addPoint(0,0);
	  p.addPoint(-6,4);
	  p.addPoint(0,5);
	  p.addPoint(6,4);
	  this.add(p);
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
Insulator.prototype = new Composite();