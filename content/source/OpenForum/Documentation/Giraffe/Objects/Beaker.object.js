function Beaker(x,y) {
  this.x= x;
  this.y= y;

  var circle = new Circle(100,300,10);
  circle.fillColor="white";
  circle.color="white";
  this.add( circle );
  circle = new Circle(200,300,10);
  circle.fillColor="white";
  circle.color="white";
  this.add( circle );
  circle = new Circle(100,20,10);
  circle.fillColor="white";
  circle.color="white";
  this.add( circle );
  circle = new Circle(200,20,10);
  circle.fillColor="white";
  circle.color="white";
  this.add( circle );
  var rectangle = new Rectangle(96,10,108,300);
  rectangle.fillColor="white";
  rectangle.color="white";
  this.add( rectangle );

  for(i=0;i<=130;i+=5) {
    if(i%10===0) {
      this.add( new Line(95,290-(i*2),3,0) );
      if(i>=100) {
        this.add( new Text(75,293-(i*2),""+i,6) );
      } else {
        this.add( new Text(80,293-(i*2),""+i,6) );
      }
    } else {
      this.add( new Line(95,290-(i*2),2,0) );
    }
  }

  var level = new Rectangle(102,10,96,280);
  level.fillColor="lightgrey";
  level.color="grey";
  this.add( level );

  level = 5;

  var liquid = new Rectangle(102,290,96,-level*2);
  liquid.fillColor="lightblue";
  liquid.color="lightblue";
  this.add( liquid );

  this.setLevel = function(newLevel) {
    level = newLevel;
    liquid.height = -level*2;
  };
}
Beaker.prototype = new Composite();