/*

* Author: 
*/
OpenForum.includeScript("/OpenForum/Giraffe/giraffe.js");

OpenForum.init = function() {
  canvas = new Canvas("canvas");
  Giraffe.Interactive.setInteractive(canvas);
  Giraffe.setAnimated(canvas);
  canvas.startAnimation(10,100,true);

  createGrid();
  createDragAndDrop();

  setInterval(checkState,100);
};

function createGrid() {

  st = new Text(50,50,"Sample Text",20,"bold 16px Arial").setFillColor("red");
  canvas.add(st);

  grid = new Composite(0,0);
  for(var x=0;x<=800;x+=40) {
    for(var y=0;y<=500;y+=40) {
      grid.add(new Line(x-5,y,10,0).setColor("#E0E0E0"));
      grid.add(new Line(x,y-5,0,10).setColor("#E0E0E0"));
    }
  }
  grid.visible=false;

  canvas.add(grid);
}

function checkState() {
  st.text = "ST:"+Giraffe.Interactive.isDragging();
  if(Giraffe.Interactive.isDragging()===true) {
    grid.visible=true;
  } else {
    grid.visible=false;
  }

  var match=false;
  for(var index in canvas.dragging) {
    //if dragging instance can be placed on target,
    item = canvas.dragging[index];
    if(item.type && item.type=="123" ) {
      match=true;
    }
  }
  // highlight target
  target.activated = match;
  if(target.activated===true) {
    target.box.setFillColor("green");
  } else {
    target.box.setFillColor("lightgreen");
    target.box.setColor("black");
  }
}

function createInstance(x,y) {
  instance = new Composite(x,y);
  var rect = new Rectangle(5,5,30,30).setFillColor("blue");
  var shadow = new Shadow();
  shadow.offsetX=5;
  shadow.offsetY=5;
  shadow.blur=5;
  shadow.color="#A0A0A0";
  rect.setShadow( shadow );
  instance.add( rect );
  instance.type="123";
  instance.onMouseReleased = function() {
    //TODO
    //If over target
    if(target.instanceOver==instance) {
      this.x = Math.round(this.x/40)*40;
      this.y = Math.round(this.y/40)*40;
      canvas.removeDraggable(instance);
      instance=null;
    } else {
      canvas.remove(instance);
    }
    //Else destroy instance
  };
  canvas.add(instance);
  canvas.makeDraggable(instance);
  canvas.setDragging(instance);
}

function createDragAndDrop() {
  //Template
  template = new Composite(400,100);
  template.box = new Rectangle(5,5,30,30).setFillColor("lightblue");
  template.add( template.box );
  template.onMousePressed = function(x,y) {
    createInstance(x-20,y-20);
  };
  template.onMouseOver = function() {
    template.box.setFillColor("blue");
  };
  template.onMouseOut = function() {
    template.box.setFillColor("lightblue");
  };
  canvas.add(template);

  //Target
  target = new Composite(100,100);
  target.box = new Rectangle(5,5,30,30).setFillColor("lightgreen");
  target.add( target.box );
  target.onMouseOver = function() {
    if(target.activated===true) {
      target.instanceOver=instance;
      target.box.setColor("red");
    }
  };
  target.onMouseOut = function() {
    target.instanceOver=null;
    target.box.setColor("black");
  };
  canvas.add(target);
}