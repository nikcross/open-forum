Giraffe.Tablet = {
		enableTouch : function(canvas) {
			var canvas = canvas;
			canvas.canvasElement.addEventListener("touchstart",
		       function(event) {
		         event.preventDefault();
		         canvas.onMouseDown( {x:event.targetTouches[0].pageX,y:event.targetTouches[0].pageY } );
		       }, false
		    );
			canvas.canvasElement.addEventListener("touchmove",
		       function(event) {
		         event.preventDefault();
		         canvas.onMouseMoved( {x:event.targetTouches[0].pageX,y:event.targetTouches[0].pageY } );
		       }, false
		    );
		  
			canvas.canvasElement.addEventListener("touchend",
		       function(event) {
		         event.preventDefault();
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