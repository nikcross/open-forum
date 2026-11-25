DEG_TO_RAD = Math.PI/180;

gridWidth = 10;
gridHeight = 10;
squareSize = 40;


NORTH = 0;
EAST = 1;
SOUTH = 2;
WEST = 3;

X=0;
Y=1;

var vector = [];
vector[NORTH]=[0,-1];
vector[EAST]=[1,0];
vector[SOUTH]=[0,1];
vector[WEST]=[-1,0];

var vectorName = [];
vectorName[NORTH] = "North";
vectorName[EAST] = "East";
vectorName[SOUTH] = "South";
vectorName[WEST] = "West";

BLOCK = "Block";
TARGET = "Target";

function Obsticle(x,y,type) {
  this.x=x;
  this.y=y;
  this.type=type;
};

var mars = {};
mars.items = [];
mars.add = function(item) {
	mars.items[mars.items.length]=item;
	mars.graphic.add(item.graphic);
}

mars.process = function() {
	var i=0;
	var p=0;
	for(i=0;i<this.items.length;i++) {
		if(this.items[i].alive==false) {
			continue;
		}
		for(p=0;p<this.obsticles.length;p++) {
			if(distance(this.items[i].graphic,this.obsticles[p].graphic)<20) {
				this.items[i].hit(this.obsticles[p]);
			}
		}
	}
}

function distance(objectA,objectB) {
	var dx = objectA.x-objectB.x;
	var dy = objectA.y-objectB.y;
	if(dx<0) dx = -dx;
	if(dy<0) dy = -dy;
	
	return Math.pow((dx*dx)+(dy*dy),0.5);
}

function createMars(target) {

	mars.graphic = new Composite(40,40);
	target.add(mars.graphic);
	
	for(x=0;x<gridWidth;x++) {
		for(y=0;y<gridHeight;y++) {
	  		if((x+y)%2==0) {
	  			mars.graphic.add(new Rectangle(x*squareSize,y*squareSize,squareSize,squareSize)
	  			.setFillColor("grey").setColor("black"));
			}
		}
	};
	
	mars.obsticles = [
	  new Obsticle(7,4,TARGET),
	  new Obsticle(2,1,BLOCK),
	  new Obsticle(5,1,BLOCK),
	  new Obsticle(7,2,BLOCK),
	  new Obsticle(1,5,BLOCK),
	  new Obsticle(2,6,BLOCK),
	  new Obsticle(4,5,BLOCK),
	  new Obsticle(5,3,BLOCK),
	  new Obsticle(6,4,BLOCK)
	];
	
	for(i=0;i<mars.obsticles.length;i++) {
	  if(mars.obsticles[i].type==BLOCK) {
			mars.obsticles[i].graphic = new Circle((mars.obsticles[i].x+0.5)*squareSize,
	  			(mars.obsticles[i].y+0.5)*squareSize,10).setFillColor("red")
	  } if(mars.obsticles[i].type==TARGET) {
			mars.obsticles[i].graphic = new Rectangle((mars.obsticles[i].x+0.25)*squareSize,
	  			(mars.obsticles[i].y+0.25)*squareSize,squareSize*0.5,squareSize*0.5).setFillColor("green")
	  }
	  mars.graphic.add( mars.obsticles[i].graphic );
	}
	
	mars.obsticles[0].graphic.animate = function() {
		mars.process();
	}
	
//	target.add(mars.graphic);
}