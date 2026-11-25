function GeneView(x,y) {
  this.x=x;
  this.y=y;

  var genes = new Array();
  for(i=0;i<90;i++) {
    genes[i] = Math.random()*2000;
  }

  var rect = new Rectangle(90,45,470,30);
  rect.color='white';
  rect.fillColor=rect.color;
  this.add(rect);

  for(i=0;i<90;i++) {
    rect = new Rectangle((i*5),50,4,20);
    rect.color="rgba(0,0,255,"+(genes[i]/2000)+")";
    rect.fillColor=rect.color;
    this.add(rect);
  }
}
GeneView.prototype = new Composite();