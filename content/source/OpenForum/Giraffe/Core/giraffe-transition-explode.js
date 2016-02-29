Giraffe.ExplodeSequence = function(target,frames) {
	this.frames = frames;
	this.target = target;
	this.canvas = target.canvasParent;
	this.register();
	this.currentFrame=0;

	this.process = function(frame) {
		if(!this.parts) {
			this.parts = getExplodingParts(target);
		}
		
		var hasMinVelocity = false;
		for(i=0;i<this.parts.length;i++) {
			this.parts[i].x+=this.parts[i].vx;
			this.parts[i].y+=this.parts[i].vy;
			this.parts[i].vx*=0.9;
			this.parts[i].vy*=0.9;
			if(this.parts[i].vx>0.5 || this.parts[i].vx<-0.5 ||
				this.parts[i].vy>0.5 || this.parts[i].vy<-0.5) {
				hasMinVelocity=true;
			}
		}
		if(hasMinVelocity==false) {
			this.currentFrame = this.frames;
		}
	};
	
	var getExplodingParts = function(composite,parts) {
		if(!parts) {
			var parts = [];
		}
		for(var i=0;i<composite.parts.length;i++) {
			if(composite.parts[i].parts) { //is sub composite
				getExplodingParts(composite.parts[i],parts);
			}
			composite.parts[i].vx=composite.parts[i].x+((Math.random()*10)-5);
			composite.parts[i].vy=composite.parts[i].y+((Math.random()*10)-5);
			parts[parts.length]=composite.parts[i];
		}
		return parts;
	};
};
Giraffe.ExplodeSequence.prototype = new Giraffe.Transition();