var robot = new function() {
  self=this;
};

function Robot(x,y) {
	this.x=x;
	this.y=y;
	this.direction=SOUTH;
	this.animationFrame=0;
	
	self = this;
	var running = false;
	var actionList=[];
	var actionIndex=0;
	var alive=true;
	
	this.addAction = function(action) {
	  this.actionList[this.actionList.length] = action;
	};
	this.clearProgram = function() {
		this.actionList = [];
	}
	this.hit = function(item) {
		if(item.type==TARGET) {
			this.alive=false;
			print("HURRAH");
		} else {
			this.alive=false;
			new Giraffe.ExplodeSequence(self.graphic,50).start();
			print("Bang");
		}
	}
	this.forward = function() {
		this.addAction(
			function() { 
				self.doForward();
			}
		);
	}
	
	this.doForward = function() {
		move = new Giraffe.MoveSequence(self.graphic,40,vector[self.direction]);
		move.process2 = move.process;
		move.trackA = this.graphic.trackA;
		move.trackB = this.graphic.trackB;
		move.process = function(frame) {
			this.trackA.y=(frame%6);
			this.trackB.y=(frame%6);
			this.process2(frame);
		};
		move.doNext = function() {
			self.nextAction();
		};
		move.start();
		print("Robot moving forward.");
	};
	this.turnLeft = function() {
		this.addAction(
			function() { 
				self.doTurnLeft();
			}
		);
	}
	this.doTurnLeft = function() {
		turn = new Giraffe.RotationSequence(self.graphic,90,-1);
		turn.process2 = turn.process;
		turn.trackA = this.graphic.trackA;
		turn.trackB = this.graphic.trackB;
		turn.process = function(frame) {
			this.trackA.y=(frame%6);
			this.trackB.y=6-(frame%6);
			this.process2(frame);
		};
		turn.doNext = function() {
			self.direction-=1;
			if(self.direction<NORTH) {
				self.direction=WEST;
			}
			print("Robot now facing "+vectorName[self.direction]);
			self.nextAction();
		};
		turn.start();
		print("Robot turning left.");
	};
	this.turnRight = function() {
		this.addAction(
			function() { 
				self.doTurnRight();
			}
		);
	}
	this.doTurnRight = function() { 
		turn = new Giraffe.RotationSequence(self.graphic,90,1);
		turn.process2 = turn.process;
		turn.trackA = this.graphic.trackA;
		turn.trackB = this.graphic.trackB;
		turn.process = function(frame) {
			this.trackA.y=6-(frame%6);
			this.trackB.y=(frame%6);
			this.process2(frame);
		};
		turn.doNext = function() {
			self.direction+=1;
			if(self.direction>WEST) {
				self.direction=NORTH;
			}
			print("Robot now facing "+vectorName[self.direction]);
			self.nextAction();
		};
		turn.start();
		print("Robot turning left.");
	};
	this.run = function() {
	  this.running=true;
	  print("Running");
	  this.actionIndex=-1;
	  this.nextAction();
	};
	this.nextAction = function() {
	  self.actionIndex++;
	  if(this.actionIndex>=self.actionList.length) {
	    self.stop();
	    return;
	  }
	  print("Step "+(self.actionIndex+1));
	  this.animationFrame=0;
	  this.actionList[this.actionIndex]();
	};
	this.stop = function() {
	  this.graphic.animate = function() {};
	  this.animationFrame=0;
	  this.running=false;
	  print("Stopped");
	};
	
	this.graphic = createRobotGraphic(this.x,this.y);
}

function createRobotGraphic(x,y) {
    var graphic = new Composite((x+0.5)*squareSize,(y+0.5)*squareSize);
	graphic.setRotation(Math.PI);
	graphic.add( new Rectangle(-10,-15,20,30).setFillColor("green"));
	graphic.add( new Rectangle(-8,2,16,8).setFillColor("lightgreen"));
	graphic.add( new Rectangle(-15,-18,5,36).setFillColor("lightblue"));
	graphic.add( new Rectangle(10,-18,5,36).setFillColor("lightblue"));
	graphic.parent=robot;
	
	graphic.vx = vector[SOUTH][X];
	graphic.vy = vector[SOUTH][Y];
	
	var trackA = new Composite(0,0);
	trackA.add( new Rectangle(-15,-18,5,5).setFillColor("blue") );
	trackA.add( new Rectangle(-15,-8,5,5).setFillColor("blue") );
	trackA.add( new Rectangle(-15,2,5,5).setFillColor("blue") );
	trackA.add( new Rectangle(-15,12,5,5).setFillColor("blue") );
	var trackB = new Composite(0,0);
	trackB.add( new Rectangle(10,-18,5,5).setFillColor("blue") );
	trackB.add( new Rectangle(10,-8,5,5).setFillColor("blue") );
	trackB.add( new Rectangle(10,2,5,5).setFillColor("blue") );
	trackB.add( new Rectangle(10,12,5,5).setFillColor("blue") );
	graphic.add(trackA);
	graphic.trackA = trackA;
	graphic.add(trackB);
	graphic.trackB = trackB;
	
	return graphic;
}