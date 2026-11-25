function PowerGraph(x,y) {
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.xTicks = [{1,2,3,4,5,6,7,8,9,10}];
	this.yTicks = [{1,2,3,4,5,6,7,8,9,10}];
	this.data = [{0,1,2,3,4,5,4,3,2,1}];
	
	this.setSize = function(width,height) {
		this.width = width;
		this.height = height;
		build();
	}
	
	var build = function() {
		//draw grid
		//draw 
	}
	
	build();
}
PowerGraph.prototype = new Composite();