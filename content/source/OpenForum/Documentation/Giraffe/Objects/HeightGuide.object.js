function HeightGuide(x,y,rotation,width,height,text) {
  this.x=x;
  this.y=y;
  this.rotation=rotation;
  this.text = text;
  this.height = height;
  this.width = width;
  this.parts = new Array();
  
  this.add( new Line(0,0,0,(this.height/2)-(this.text.length/2*8)) );
  this.add( new Line(0,(this.height/2)+(this.text.length*2),0,(this.height/2)-(text.length*2)) );
  this.add( new Line(0,height,-width,0) );
  this.add( new Line(0,0,-width,0) );
  this.add( new Polygon(0,0).addPoint(-1,5).addPoint(0,0).addPoint(1,5) );
  this.add( new Polygon(0,height).addPoint(-1,-5).addPoint(0,0).addPoint(1,-5) );
  this.add( new Text(4,height/2+(text.length/2*4),text,8).setRotation(-Math.PI/2) );  

  this.setColor = function(color) {
    for(var i=0;i<this.parts.length;i++) {
      this.parts[i].setColor(color);
    }
    return this;
  }
}
HeightGuide.prototype = new Composite();