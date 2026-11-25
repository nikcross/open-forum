//Version 1.0.24
function Dial(x,y,newConfig) {

  var config = {
    colors: {
      pointer: "rgb(250,0,0)",
      mark: "rgb(0,0,0)",
      text: "rgb(0,0,0)",
      border: "rgb(100,100,100)",//new GradientColor(canvas,"rgb(100,100,100)","rgb(200,200,200)",0,-200,0,200).getColor(),
      background: "rgb(250,250,250)",
      face: "rgb(150,150,150)",
      shadow: "rgb(50,50,50)"
    }
  };
  
  if(newConfig && newConfig.colors) {
    for(var key in newConfig.colors) {
      if(config.colors[key]) config.colors[key] = newConfig.colors[key];
    }
  }

  var demoMode = false;
  var background = null;
  var minimum = 0;
  var maximum = 10;
  var value = 0;
  var titleText = "";
  var dial = {};

  this.build = function(canvas,layer) {
    if(!layer) layer = canvas;
    dial = new Composite(x,y);

    dial.add( new Circle(200,200,150)
             .setFillColor( config.colors.border )
            );

    dial.add( new Circle(200,200,130).setFillColor(config.colors.background) );

    background = new Composite(200,200);
    dial.add(background);

    for(var i=0;i<=Math.PI;i+=Math.PI/20) {
      dial.add( new Composite(200,200).add(new Rectangle(-1,115,2,10).setFillColor(config.colors.mark)).setRotation( i + (Math.PI/2)) );
    }    

    var span = maximum - minimum;
    var count = minimum;
    for(var i=0;i<=Math.PI;i+=Math.PI/5) {
      var mark =  new Composite(200,200);
      mark.add(new Rectangle(-2,105,4,20).setFillColor(config.colors.mark)).setRotation( i + (Math.PI/2));
      mark.add( new Composite(4,90).add( new Text(0,0,""+Math.round(count*10)/10,12,"Arial").setColor(config.colors.mark).setRotation( Math.PI ) ) );
      dial.add( mark );

      count += (span/5);
    }

    var pointer = new Composite(200,200);
    pointer.add( new Rectangle(-2,-30,4,-60).setFillColor(config.colors.pointer).setColor(config.colors.pointer)  );

    pointer.add( new Polygon(-10,-90)
                .addPoint(0,0).addPoint(20,0).addPoint(10,-30)
                .setFillColor(config.colors.pointer).setColor(config.colors.pointer)  );
    pointer.setShadow( {color: config.colors.shadow, blur: 5, offsetX: 3, offsetY: 3} );

    dial.add(pointer);

    dial.add( new Arc(200,200,20,140,130).setFillColor(config.colors.face) );
    dial.add( new Circle(200,200,60).setFillColor().setShadow( {color: config.colors.shadow, blur: 5, offsetX: 3, offsetY: 3} ) );
    dial.add( new Circle(200,200,60).setFillColor(config.colors.face) );

    var reading = new Text(200,215,"?",40,"Arial").setFillColor(config.colors.text).setColor(config.colors.text);
    dial.add( reading );

    var title = new Text(200,290,titleText,30,"Arial").setFillColor(config.colors.text).setColor(config.colors.text);
    dial.add(title);

    pointer.rotation = 0;
    pointer.animate = function(frame) {
      if(demoMode && frame%10===0) { // demo mode
        var d = (Math.random()*0.4)-0.2;
        value+=d;
        if(value < minimum) value = minimum;
        if(value > maximum) value = maximum;
      }

      pointer.rotation = ((((value-minimum)/maximum))*(Math.PI))-(Math.PI/2);
      reading.text = Math.round(value*10)/10;
      reading.x = 200-(reading.width/2);

      title.text = titleText;
      title.x = 200-(title.width/2);
    };

    layer.add(dial);
    return this;
  };

  this.setMinimum = function(min) {
    minimum = min;
    return this;
  };

  this.setMaximum = function(max) {
    maximum = max;
    return this;
  };

  this.setValue = function(v) {
    value = v;
    return this;
  };

  this.setTitle = function(text) {
    titleText = text;
    return this;
  };

  this.setScale = function(scale) {
    dial.scaleX=scale;
    dial.scaleY=scale;
    return this;
  };
  
  this.setVisible = function(visible) {
    dial.visible = visible;
    return this;
  };

  this.setDemoMode = function(state) {
    demoMode = state;
    return this;
  };

  this.getBackground = function() {
    return background;
  };
}

// var d = new Dial(0,0).setValue(0).setMinimum(35).setMaximum(100).setDemoMode(true).setTitle("Demo").build(canvas);