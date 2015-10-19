var width = 800;
var height = 600;

for(var i=0;i<50;i++) {
  
  var red = Math.floor(Math.random()*256);
  var green = Math.floor(Math.random()*256);
  var blue = Math.floor(Math.random()*256);
  
  var color = "rgba("+red+","+green+","+blue+",0.5)";
  var fillColor = "rgba("+red+","+green+","+blue+",0.2)";
  var circle = new Circle(Math.random()*width,Math.random()*height,Math.floor(Math.random()*10)+5).setFillColor( fillColor ).setColor( color );
  circle.vx = (Math.random() * 5)-2.5;
  circle.vy = (Math.random() * 5)-2.5;
  circle.animate = function(frame) {
    this.x+=this.vx;
    this.y+=this.vy;
    
    if(this.x>width || this.x<0) {
      this.vx = -this.vx;
      this.x+=this.vx;
    }
    if(this.y>height || this.y<0) {
      this.vy = -this.vy;
      this.y+=this.vy;
    }
  };

  giraffe.canvas.add( circle );
}