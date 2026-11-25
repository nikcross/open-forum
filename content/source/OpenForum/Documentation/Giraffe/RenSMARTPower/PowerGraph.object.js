/*
* Author: 
* Description: 
*/

function PowerGraph(x,y) {
	this.x = x;
	this.y = y;
	var width = width;
	var height = height;
	var xTicks = ["12pm","3am","6am","9am","12am","3pm","6pm","9pm","12pm"];
	var yTicks = [0,1,2,3,4,5,6,7,8,9,10];
	var yUnits = "kWh";
	var xUnits = "";
	var data = [0,1,2,3,4,5,4,3,2,1,0,1,2,3,4,5,4,3,2,1,0,1,2,3,4,5,4,3,2,1];
	var pointer,pointerText;
	
	this.setSize = function(newWidth,newHeight) {
		width = newWidth;
		height = newHeight;
		this.build();
		return this;
	};
	
	this.build = function() {
		//empty composite
		this.parts=[];
		//draw border
		this.add( new Rectangle(0,0,width,height) );
		//draw grid
		for(var i=0;i<width;i+=width/xTicks.length) {
			this.add( new Line(i,height,0,-height).setColor("lightgrey") );
		}
		for(var i=0;i<height;i+=height/yTicks.length) {
			this.add( new Line(0,i,width,0).setColor("lightgrey") );
		}
		//draw  xTicks
		for(var i=0;i<xTicks.length;i++) {
			lable = new Text(
					i*(width/xTicks.length),
					height+10,
					xTicks[i],
					10
				).setFillColor("black");
			lable.rotation = Math.PI/2;
			this.add( lable );
		}
		//draw  yTicks
		for(var i=0;i<yTicks.length;i++) {
			lable = new Text(
					-20,
					height-(i*(height/yTicks.length)),
					yTicks[i],
					10
				).setFillColor("black");
			this.add( lable );
		}
		//draw data sets
		dataSet = new Polygon(0,0);
		dataSet.addPoint(0,height);
		for(var i=0;i<data.length;i++) {
			var dataPoint = this.getDataPoint(data,i);
			dataSet.addPoint(
					dataPoint.x,
					dataPoint.y
				).setColor("green")
				.setFillColor("rgba(100,255,100,0.5)");
		}
		dataSet.addPoint(width,height);
		this.add(dataSet);
		
		//draw data pointer
		pointer = new Rectangle(50,50,2,2).setColor("green");
		pointer.visible = false;
		pointerText = new Text(50,30,"Pointer",10);
		pointerText.visible = false;
		this.add(pointer);
		this.add(pointerText);
	};
	
	this.onMouseOver = function(x,y) {
		var dataPoint = this.findNearestData(x-this.x,y-this.y);
		
		pointer.x = dataPoint.x-1;
		pointer.y = dataPoint.y-1;
		
		pointerText.text = dataPoint.value+" "+yUnits;
		pointerText.x = dataPoint.x;
		pointerText.y = dataPoint.y-20;
		
		pointer.visible=true;
		pointerText.visible=true;
	};
	this.onMouseOut = function(x,y) {
		pointer.visible=false;
		pointerText.visible=false;
	};
	
	this.findNearestData = function(x,y) {
		var distance = -1;
		var found = null;
		for(var i=0;i<data.length;i++) {
			var dataPoint = this.getDataPoint(data,i);
			var testDistance = this.getDistance(x,y,dataPoint.x,dataPoint.y);
			if(found==null) {
				found=dataPoint;
				distance = testDistance;
			} else if(testDistance<distance) {
				found=dataPoint;
				distance = testDistance;
			}
		}
		
		return found;
	};
	
	this.getDistance = function(x1,y1,x2,y2) {
		var dx = x2-x1;
		var dy = y2-y1;
		if(dy<0) dy=-dy;
		if(dx<0) dx=-dx;
		var distance = Math.pow((dx*dx)+(dy*dy),0.5);
		
		return distance;
	};
	
	this.getDataPoint = function(dataSet,index) {
		var x = index*(width/data.length);
		var y = height-(dataSet[index]*10);
		
		return {x: x,y: y,value: dataSet[index]};
	};
	
	this.build();
}
PowerGraph.prototype = new Composite();