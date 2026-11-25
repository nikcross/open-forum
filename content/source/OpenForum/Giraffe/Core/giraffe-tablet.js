Giraffe.Tablet = {
  enableTouch : function(canvas) {
    var canvas = canvas;
    var pinchState = {
      active: false,
      lastDistance: 0
    };
    var tapState = {
      active: false,
      touchId: null,
      startX: 0,
      startY: 0,
      moved: false
    };
    var TAP_MOVE_THRESHOLD = 12;

    var getTouchDistance = function(t1, t2) {
      var dx = t1.pageX - t2.pageX;
      var dy = t1.pageY - t2.pageY;
      return Math.sqrt((dx * dx) + (dy * dy));
    };

    var getTouchMidpoint = function(t1, t2) {
      return {
        x: (t1.pageX + t2.pageX) / 2,
        y: (t1.pageY + t2.pageY) / 2
      };
    };

    var handlePinchZoom = function(touches) {
      if(touches.length < 2) return;
      var t1 = touches[0];
      var t2 = touches[1];
      var distance = getTouchDistance(t1, t2);
      if(pinchState.lastDistance <= 0 || distance <= 0) {
        pinchState.lastDistance = distance;
        return;
      }
      var ratio = distance / pinchState.lastDistance;
      pinchState.lastDistance = distance;
      var midpoint = getTouchMidpoint(t1, t2);

      if(canvas.canvasElement && typeof canvas.canvasElement.onwheel === "function") {
        var deltaY = (1 - ratio) / 0.001;
        canvas.canvasElement.onwheel({
          preventDefault: function(){},
          deltaY: deltaY,
          x: midpoint.x,
          y: midpoint.y
        });
      }
    };

    var resetTapState = function() {
      tapState.active = false;
      tapState.touchId = null;
      tapState.moved = false;
    };

    canvas.canvasElement.addEventListener("touchstart",
                                          function(event) {
                                            event.preventDefault();
                                            if(event.targetTouches.length >= 2) {
                                              pinchState.active = true;
                                              pinchState.lastDistance = getTouchDistance(event.targetTouches[0], event.targetTouches[1]);
                                              resetTapState();
                                              return;
                                            }
                                            pinchState.active = false;
                                            pinchState.lastDistance = 0;
                                            if(event.targetTouches.length) {
                                              var touch = event.targetTouches[0];
                                              tapState.active = true;
                                              tapState.touchId = touch.identifier;
                                              tapState.startX = touch.pageX;
                                              tapState.startY = touch.pageY;
                                              tapState.moved = false;
                                              canvas.onMouseDown( {x:touch.pageX,y:touch.pageY } );
                                            }
                                          }, false
                                         );
    canvas.canvasElement.addEventListener("touchmove",
                                          function(event) {
                                            event.preventDefault();
                                            if(pinchState.active && event.targetTouches.length >= 2) {
                                              handlePinchZoom(event.targetTouches);
                                              return;
                                            }
                                            if(event.targetTouches.length) {
                                              var touch = event.targetTouches[0];
                                              if(tapState.active) {
                                                var dx = touch.pageX - tapState.startX;
                                                var dy = touch.pageY - tapState.startY;
                                                if(Math.sqrt((dx * dx) + (dy * dy)) > TAP_MOVE_THRESHOLD) {
                                                  tapState.moved = true;
                                                }
                                              }
                                              canvas.onMouseMoved( {x:touch.pageX,y:touch.pageY } );
                                            }
                                          }, false
                                         );

    canvas.canvasElement.addEventListener("touchend",
                                          function(event) {
                                            event.preventDefault();
                                            if(pinchState.active && event.targetTouches.length < 2) {
                                              pinchState.active = false;
                                              pinchState.lastDistance = 0;
                                              resetTapState();
                                              return;
                                            }
                                            if(tapState.active && event.changedTouches && event.changedTouches.length) {
                                              var touch = event.changedTouches[0];
                                              canvas.onMouseUp( {x:touch.pageX,y:touch.pageY} );
                                              if(!tapState.moved && typeof canvas.onClick === "function") {
                                                canvas.onClick( {x:touch.pageX,y:touch.pageY} );
                                              }
                                              resetTapState();
                                              return;
                                            }
                                            canvas.onMouseUp( {x:0,y:0} );
                                          }, false
                                         );
  }
};

var tiltMouseX=0;
var tiltMouseY=0;
var tiltMouseDown=false;
Giraffe.Tablet.convertRotationToMouse = function(canvas) {
  Giraffe.Tablet.noramlizeOrientationEvents();
  deviceOrientationHandler = function(tiltLR, tiltFB, dir, motUD) {
    //		var canvas = canvas;

    console.log( "event: tiltLR="+tiltLR+", tiltFB="+tiltFB+", dir="+dir+", motUD="+motUD );

    var mouseClick = false;
    if(tiltLR!=0 && tiltLR!=null) {
      if(tiltMouseDown==false) {
        mouseClick=true;
      }
      tiltMouseX+=tiltLR;
    }
    if(tiltFB!=0 && tiltFB!=null) {
      if(tiltMouseDown==false) {
        mouseClick=true;
      }
      tiltMouseY+=tiltFB;
    }
    if(mouseClick==true) {
      tiltMouseDown=true;
      canvas.onMouseDown( {x:tiltMouseX,y:tiltMouseY } );
    } else if(tiltLR==0 && tiltFB==0) {
      tiltMouseDown=false;
      canvas.onMouseUp( {x:tiltMouseX,y:tiltMouseY } );
    }
    canvas.onMouseMoved( {x:tiltMouseX,y:tiltMouseY } );
  };
};

//http://www.html5rocks.com/en/tutorials/device/orientation/
Giraffe.Tablet.noramlizeOrientationEvents = function() {
  if (window.DeviceOrientationEvent) {
    // Listen for the deviceorientation event and handle the raw data
    window.addEventListener('deviceorientation', function(eventData) {
      // gamma is the left-to-right tilt in degrees, where right is positive
      var tiltLR = eventData.gamma;

      // beta is the front-to-back tilt in degrees, where front is positive
      var tiltFB = eventData.beta;

      // alpha is the compass direction the device is facing in degrees
      var dir = eventData.alpha;

      // deviceorientation does not provide this data
      var motUD = null;

      // call our orientation event handler
      deviceOrientationHandler(tiltLR, tiltFB, dir, motUD);
    }, false);
  } else if (window.OrientationEvent) {
    window.addEventListener('MozOrientation', function(eventData) {
      // x is the left-to-right tilt from -1 to +1, so we need to convert to degrees
      var tiltLR = eventData.x * 90;

      // y is the front-to-back tilt from -1 to +1, so we need to convert to degrees
      // We also need to invert the value so tilting the device towards us (forward) 
      // results in a positive value. 
      var tiltFB = eventData.y * -90;

      // MozOrientation does not provide this data
      var dir = null;

      // z is the vertical acceleration of the device
      var motUD = eventData.z;

      // call our orientation event handler
      deviceOrientationHandler(tiltLR, tiltFB, dir, motUD);
    }, false);
  } else {
    console.log( "Not supported on your device or browser." );
  }
}
