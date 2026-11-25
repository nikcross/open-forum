function Ladder(x,y) {
  this.x=x;
  this.y=y;
  this.height=6*-60;
  this.width=0.5*60;
  for(i=(thisHeight/(thisWidth/2))+1;i<0;i++) {
    this.add( new Rectangle(-(thisWidth/2),i*(thisWidth/2),thisWidth,2).setColor('grey').setFillColor('lightGrey') );
  }
  this.add( new Rectangle(-(this.width/2),0,2,this.height).setColor('grey').setFillColor('lightGrey') );
  this.add( new Rectangle(this.width/2,0,2,this.height).setColor('grey').setFillColor('lightGrey') );
}
Ladder.prototype = new Composite();