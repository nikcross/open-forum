example = { run: function() {
//START
var displayText = "Here is some text to display.";
var text = new Text(0,0,"",20);
text.font="Arial";
var box = new Rectangle(0,0,10,10);

text.cursor=0;
text.animate = function(frame) {
	if(frame%5==0) {
		text.cursor++;
		if(text.cursor>displayText.length) {
			text.cursor=0;
		};
		text.text=displayText.substring(0,text.cursor);
	};
};
box.animate = function(frame) {
	box.height = -text.textSize;
	box.width = text.width;
};
component = new Composite(50,50);
component.add( box );
component.add( text );

canvas.add(component);
//END
}}

exampleLoaded();