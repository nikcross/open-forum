function createNumberPad(x,y,keyFunction,keyA,keyB) {
	keyDownHandler2 = Giraffe.Interactive.keyDownHandler;
	Giraffe.Interactive.keyDownHandler = function(event){
		keyDownHandler2(event);
	    if (document.all) {
	    	event = window.event;
	        pressedKey = event.keyCode; }
	    if (event.which) {
	        pressedKey = event.which;
	    }
	    if(pressedKey==13) {
	    	keyB.fn();
	    }
	    if(pressedKey==8) {
	    	keyA.fn();
	    }
	    character = String.fromCharCode(pressedKey);
	    rx = new RegExp("[0123456789]","g")
	    if( rx.test(character) ) {
	    	keyFunction(character);
	    }
	}
	document.onkeydown = Giraffe.Interactive.keyDownHandler;

	numberPad = new Composite(x,y);
	
	createNumberKey(numberPad,0,360,"1",keyFunction);
	createNumberKey(numberPad,120,360,"2",keyFunction);
	createNumberKey(numberPad,240,360,"3",keyFunction);
	createNumberKey(numberPad,0,240,"4",keyFunction);
	createNumberKey(numberPad,120,240,"5",keyFunction);
	createNumberKey(numberPad,240,240,"6",keyFunction);
	createNumberKey(numberPad,0,120,"7",keyFunction);
	createNumberKey(numberPad,120,120,"8",keyFunction);
	createNumberKey(numberPad,240,120,"9",keyFunction);
	createNumberKey(numberPad,0,0,keyA.text,keyA.fn);
	createNumberKey(numberPad,120,0,"0",keyFunction);
	createNumberKey(numberPad,240,0,keyB.text,keyB.fn);

	return numberPad;
}

function createNumberKey(numberPad,x,y,text,keyFunction) {
	numberKey = new Composite(x,y);
	numberKey.background = new RoundedRectangle(0,0,100,100,10).setFillColor("black");
	numberKey.add( numberKey.background );
	if(text.length==1) {
		numberKey.add( new Text(20,70,text,60,"sans").setFillColor("white") );
	} else {
		numberKey.add( new Text(10,60,text,40,"sans").setFillColor("white") );
	}
	numberPad.add(numberKey);
	numberKey.onMouseOver = function() { this.background.setFillColor("blue"); };
	numberKey.onMouseOut = function() { this.background.setFillColor("black"); };
	numberKey.onMousePressed = function() {	var keyText=text;this.background.setFillColor("red");keyFunction(keyText) };
}