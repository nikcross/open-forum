function createStartMessage(x,y) {
	startMessage = new Composite(x,y);
	
	startMessage.add( new RoundedRectangle(0,0,350,150,10).setFillColor("rgba(0,0,0,0.7)") );
	startMessage.title = new Text(20,40,"title",25,"Arial").setFillColor("yellow");
	startMessage.add( startMessage.title );
	startMessage.label = new Text(40,70,"label",20,"Arial").setFillColor("yellow");
	startMessage.add( startMessage.label );
	
	startMessage.button1 = new Text(40,100,"button1",20,"Arial").setFillColor("yellow");
	startMessage.add( startMessage.button1 );
	startMessage.button1.action=function(){};
	startMessage.button1.onMousePressed = function(){startMessage.button1.action();};
	
	startMessage.button2 = new Text(120,100,"button2",20,"Arial").setFillColor("yellow");
	startMessage.add( startMessage.button2 );
	startMessage.button2.action=function(){};
	startMessage.button2.onMousePressed = function(){startMessage.button2.action();};
	
	startMessage.button3 = new Text(200,100,"button3",20,"Arial").setFillColor("yellow");
	startMessage.add( startMessage.button3 );
	startMessage.button3.action=function(){};
	startMessage.button3.onMousePressed = function(){startMessage.button3.action();};
	
	startMessage.visible=false;
	
	canvas.add(startMessage);
	
	startMessage.hide = new Giraffe.FlipOutY(startMessage,20);
	startMessage.show = new Giraffe.FlipInY(startMessage,20);
	startMessage.hide.doNext = function() {
		startMessage.visible=false;
	};
	
	return startMessage;
}