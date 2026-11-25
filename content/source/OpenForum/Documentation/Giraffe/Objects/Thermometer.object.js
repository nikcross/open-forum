function Thermometer() {
	circle = new Circle(100,300,30);
	circle.fillColor="white";
	circle.color="white";
	this.add( circle );
	circle = new Circle(100,20,10);
	circle.fillColor="white";
	circle.color="white";
	this.add( circle );
	rectangle = new Rectangle(90,20,20,260);
	rectangle.fillColor="white";
	rectangle.color="white";
	this.add( rectangle );
	circle = new Circle(100,300,15);
	circle.fillColor="red";
	circle.color="red";
	this.add( circle );
	rectangle = new Rectangle(98,20,4,270);
	rectangle.fillColor="lightgrey";
	rectangle.color="grey";
	this.add( rectangle );
	for(i=0;i<=120;i+=5) {
	  if(i%10==0) {
	    this.add( new Line(90,270-(i*2),3,0) );
	  } else {
	    this.add( new Line(90,270-(i*2),2,0) );
	    if(i-15<0||i-15>=100) {
	      this.add( new Text(70,263-(i*2),""+(i-15),6) );
	    } else {
	      this.add( new Text(75,263-(i*2),""+(i-15),6) );
	    }
	  }
	}
	this.add( new Line(90,230,20,0) );
	
	temperature = 30;
	
	level = new Rectangle(98,290,4,-((30+temperature)*2));
	level.fillColor="red";
	level.color="red";
	
	this.add( level);
}
Thermometer.prototype = new Composite();