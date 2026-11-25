Giraffe.addSelectBox = function(canvas) {
  var selectBox = new RoundedRectangle(0,0,10,10,5).setColor("red").setFillColor("rgba(255,0,0,0.5)");
  canvas.selectBox = selectBox;
  canvas.onMousePressed = function(x,y) {
    if(canvas.dragging.length==0) {
      selectBox.x = x;
      selectBox.y = y;
      selectBox.width = 0;
      selectBox.height = 0;
      selectBox.visible = true;
    }
  };

  canvas.selectBox.callBack = function() {};

  canvas.onMouseOver = function(x,y) {
    if(selectBox.visible) {
      if(canvas.dragging.length==0) {
        selectBox.width = x-selectBox.x;
        selectBox.height = y-selectBox.y;
      } else {
        selectBox.visible = false;
      }
    }
  };

  canvas.onMouseReleased = function() {
    if(selectBox.visible) {
      selectBox.visible = false;
      selectBox.callBack( selectBox );
    }
  };

  selectBox.visible = false;
  canvas.add( selectBox );
};