function createStopWatch(x,y) {
	stopWatch = new Composite(x,y);
	
	stopWatch.add( new Circle(0,0,100) );
	stopWatch.add( new Circle(0,0,90).setFillColor("blue") );
	stopWatch.display = new Arc(0,0,270,10,90).setFillColor("red");
	stopWatch.add(stopWatch.display);
	
	return stopWatch;
}