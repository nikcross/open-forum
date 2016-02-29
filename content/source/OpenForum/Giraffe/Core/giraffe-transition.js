/*
* Author: 
* Description: 
*/
Giraffe.Transition = function(target,frames) {
	this.frames = frames;
	this.target = target;
	this.canvas = null;
	this.currentFrame=0;
	this.play = false;
	
	this.start = function() {
		this.register();
		this.currentFrame=0;
		this.play=true;
	};
	this.process = function(frame){};
	
	this.processFrame = function() {
		if(this.play==false) { return; };
		this.currentFrame++;
		if(this.currentFrame==this.frames+1) {
			this.unregister();
			this.doNext();
		}
		if(this.currentFrame>this.frames) {
			return false;
		}
		
		this.process(this.currentFrame);
	};
	
	this.doNext = function(){};
	this.register = function(){
		this.canvas.addAnimationListener(this);
	};
	this.unregister = function(){
		this.canvas.removeAnimationListener(this);
	};
};