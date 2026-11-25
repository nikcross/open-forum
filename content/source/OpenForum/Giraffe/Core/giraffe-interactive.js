/*
* Author: 
* Description: 
*/
Giraffe.Interactive = {
  shiftKeyDown : false,
  controlKeyDown : false,
  keyDown : null,
  keyDownListeners : [],
  keyUpListeners : [],
  init : function() {
    document.onkeydown = Giraffe.Interactive.keyDownHandler;
    document.onkeyup = Giraffe.Interactive.keyUpHandler;
    shiftKeyDown = false;
    controlKeyDown = false;
  },
  keyDownHandler : function(e) {
    var pressedKey;
    if (document.all) { e = window.event;
                       pressedKey = e.keyCode; }
    if (e.which) {
      pressedKey = e.which;
    }
    if(pressedKey===16) {
      Giraffe.Interactive.shiftKeyDown=true;
    } else if(pressedKey===17) {
      Giraffe.Interactive.controlKeyDown=true;
    }
    Giraffe.Interactive.keyDown = pressedKey;
    
    for(var l in Giraffe.Interactive.keyDownListeners) {
      Giraffe.Interactive.keyDownListeners[l](pressedKey);
    }
  },
  keyUpHandler : function(e) {
    var pressedKey;
    if (document.all) { e = window.event;
                       pressedKey = e.keyCode; }
    if (e.which) {
      pressedKey = e.which;
    }
    if(pressedKey===16) {
      Giraffe.Interactive.shiftKeyDown=false;
    } else if(pressedKey===17) {
      Giraffe.Interactive.controlKeyDown=false;
    }
    for(var l in Giraffe.Interactive.keyUpListeners) {
      Giraffe.Interactive.keyUpListeners[l](pressedKey);
    }
    
    Giraffe.Interactive.keyDown = null;
  },
  isDragging : function() {
    if( self.dragging && self.dragging.length>0 ) {
      return true;
    } else {
      return false;
    }
  },
  setInteractive : function(canvas) {
    var canvas = canvas;

    canvas.convertEvent = function(event,element) { 
      position = getPosition(element);
      x=event.x-position[Giraffe.X]+window.scrollX;
      y=event.y-position[Giraffe.Y]+window.scrollY;

      x = x / canvas.scaleX;
      y = y / canvas.scaleY;

      return {
        x : x, y : y  
      };
    };

    canvas.onClick = function(event) {
      event = canvas.convertEvent(event,canvas.canvasElement);

      for(var loop=canvas.graphicsObjects.length-1;loop>=0;loop--)
      {
        if(canvas.graphicsObjects[loop].visible===true && canvas.graphicsObjects[loop].isInside(event.x,event.y)) {
          canvas.graphicsObjects[loop].onClick(event.x,event.y);
        }
      }
    };
    canvas.onMouseDown = function(event) {
      event = canvas.convertEvent(event,canvas.canvasElement);

      if(canvas.dragAndDrop==true) {
        canvas.dragStart=[event.x,event.y];
        canvas.lastDx = 0;
        canvas.lastDy = 0;

        canvas.dragging=new Array();
      }
      for(var d = canvas.draggable.length-1; d>=0 ; d--) {
        dragTarget=canvas.draggable[d];

        var root = dragTarget;
        var stack = [];
        while( root.parent ) {
          root = root.parent;
          stack.push(root);
        }

        var x = event.x;
        var y = event.y;

        for( var i = stack.length-1; i>=0; i--  ) {
          var p = stack[i].getRelativePosition( x,y );	
          x = p.x;
          y = p.y;	
        }

        if(dragTarget.isInside( x, y )) {
          var included = false;
          for(var check in canvas.dragging) {
            check = canvas.dragging[check];
            if(check==dragTarget) {
              included=true;
              break;
            }
          }
          if(included==true) {
            continue;
          }
          dragTarget.dragging=true;
          canvas.dragging[canvas.dragging.length]=dragTarget;
          dragTarget.dragStart=[dragTarget.x,dragTarget.y];
          if(Giraffe.Interactive.shiftKeyDown==false) break;
        }
      }

      for(this.loop=0;this.loop<canvas.graphicsObjects.length;this.loop++)
      {
        if(canvas.graphicsObjects[this.loop].visible===true && canvas.graphicsObjects[this.loop].isInside(event.x,event.y)) {
          canvas.graphicsObjects[this.loop].onMousePressed(event.x,event.y);
        }
      }

      canvas.onMousePressed(event.x,event.y);
    };

    canvas.onMousePressed = function(x,y) {};
    canvas.onMouseReleased = function(x,y) {};

    canvas.setDragging = function(dragTarget) {

      // alert("Here: "+dragTarget.x+","+dragTarget.y);

      dragTarget.dragging=true;
      canvas.dragging[canvas.dragging.length]=dragTarget;
      dragTarget.dragStart=[dragTarget.x,dragTarget.y];
    };
    canvas.onMouseUp = function(event) {
      event = canvas.convertEvent(event,canvas.canvasElement);

      if(canvas.dragAndDrop==true && canvas.dragging.length>0) {
        for(this.loop=0;this.loop<canvas.graphicsObjects.length;this.loop++) {
          if(canvas.graphicsObjects[this.loop].dragging) {
            canvas.graphicsObjects[this.loop].dragging=false;
          }
          if(canvas.graphicsObjects[this.loop].isInside(event.x,event.y)) {
            if(canvas.graphicsObjects[this.loop].onCatch) {
              for(var dropped in canvas.dragging) {
                dropped = canvas.dragging[dropped];
                if(canvas.graphicsObjects[this.loop]==dropped) {
                  continue;
                }
                canvas.graphicsObjects[this.loop].onCatch(dropped,event.x,event.y);
              }
            }
          }
        }
        canvas.dragging=new Array();
      }
      for(this.loop=0;this.loop<canvas.graphicsObjects.length;this.loop++)
      {
        canvas.graphicsObjects[this.loop].onMouseReleased(event.x,event.y);
      }

      canvas.onMouseReleased(event.x,event.y);
    };
    canvas.onMouseMoved = function(event) {
      event = canvas.convertEvent(event,canvas.canvasElement);

      if(canvas.dragAndDrop==true) {
        var dragDX = event.x-canvas.dragStart[0];
        var dragDY = event.y-canvas.dragStart[1];

        for(var dragTarget in canvas.dragging) {

          dragTarget = canvas.dragging[dragTarget];
          
          var scaleX = 1;
          var scaleY = 1;
          var parent = dragTarget.parent;
          while( parent ) {
            scaleX = scaleX * parent.scaleX;
            scaleY = scaleY * parent.scaleY;
            parent = parent.parent;
          }

          dragTarget.x = dragTarget.x+((dragDX-canvas.lastDx)/scaleY);
          dragTarget.y = dragTarget.y+((dragDY-canvas.lastDy)/scaleX);
        }

        canvas.lastDx = dragDX;
        canvas.lastDy = dragDY;
      }
      for(this.loop=0;this.loop<canvas.graphicsObjects.length;this.loop++)
      {
        if(canvas.graphicsObjects[this.loop].isInside(event.x,event.y)) {
          canvas.graphicsObjects[this.loop].mouseOver=true;
          canvas.graphicsObjects[this.loop].onMouseOver(event.x,event.y);
        } else if(canvas.graphicsObjects[this.loop].mouseOver==true) {
          canvas.graphicsObjects[this.loop].mouseOver=false;
          canvas.graphicsObjects[this.loop].onMouseOut(event.x,event.y);
        }
      }

      canvas.onMouseOver(event.x,event.y);
    };

    canvas.onMouseOver = function(x,y){};

    canvas.makeDraggable = function(object) {
      this.dragAndDrop = true;
      this.draggable[this.draggable.length]=object;
      object.draggable = true;
    };
    canvas.removeDraggable = function(object) {
      //this.dragAndDrop = false;
      var foundIndex = -1;
      for(var index in this.draggable) {
        if(this.draggable[index]==object) {
          foundIndex = index;
          break;
        }
      }
      if(foundIndex!=-1) {
        object.draggable = false;
        this.draggable.splice(foundIndex,1);
      }
    };

    canvas.dragStart = [0,0];
    canvas.dragging = new Array();
    canvas.draggable = new Array();
    canvas.dragAndDrop = false; 

    canvas.canvasElement.onmousemove = canvas.onMouseMoved;
    canvas.canvasElement.onmouseup = canvas.onMouseUp;
    canvas.canvasElement.onmousedown = canvas.onMouseDown;
    canvas.canvasElement.onclick = canvas.onClick;
  }
};
Giraffe.Interactive.init();

/* behaviours */
function setReveal(target,reveal) {
  target.onMouseOver = function(x,y) {
    reveal.visible=true;
  };
  target.onMouseOut = function(x,y) {
    reveal.visible=false;
  };
  reveal.visible=false;
}

function getPosition(obj) {
  this.curleft = this.curtop = 0;
  if (obj.offsetParent) {
    this.curleft = obj.offsetLeft;
    this.curtop = obj.offsetTop;
    obj = obj.offsetParent;
    while (obj) {
      this.curleft += obj.offsetLeft;
      this.curtop += obj.offsetTop;
      obj = obj.offsetParent;
    }
  }
  return [this.curleft,this.curtop];
}