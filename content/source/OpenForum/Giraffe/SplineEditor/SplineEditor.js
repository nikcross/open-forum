/*
* Author: 
* Description: 
*/
var SplineEditor = function(width,height,giraffeCanvas,element) {
  var self=this;
   Giraffe.busy = false;

  var ls = 0;
  var newPolygon = true;
  var polygon = null;


  var layer = new Composite(0,0);
  var background = new Rectangle(0,0,width,height).setFillColor("rgba(200,200,255,0.6)");

  layer.add( background );

  background.onClick = function(x,y) {
    if( Giraffe.busy===true ) return;

    var newPolygon = false;
    if(polygon===null) {
      polygon = new Polygon(0,0);
      //polygon.smooth = true;
      polygon.closed = false;
      newPolygon = true;
    }

    addPoint(x,y);

    if(newPolygon===true) { 
      layer.add(polygon);
    }

    background.onMouseOver = function(x,y) {
      lx = x;
      ly = y;
    };

    background.animate = function(frame) {
      if(polygon!==null) {
        for(var i=0;i<polygon.points.length;i++) {
          if( i===polygon.points.length-1 ) {
            polygon.points[i][2].setFillColor("red");
          } else {
            polygon.points[i][2].setFillColor(null);
          }

          polygon.points[i][0] = polygon.points[i][2].x;
          polygon.points[i][1] = polygon.points[i][2].y;
        }

        for(var i=0;i<polygon.points.length-1;i++) {
          // if distance to line a-b < 7
          var p = {x: lx,y: ly};
          var p1 = {x: polygon.points[i][0],y: polygon.points[i][1]};
          var p2 = {x: polygon.points[i+1][0],y: polygon.points[i+1][1]};
          if( distanceOfPointFromLine(p,p1,p2)<7 ) {
            polygon.points[i][2].setFillColor("green");
            polygon.points[i+1][2].setFillColor("green");
            break;
          }
        }
      }
    };
  };

  var addPoint = function(x,y) {
    var point = null;

    if(polygon!==null && polygon.points.length>1 && Giraffe.Interactive.shiftKeyDown===false) {
      for(var i=0;i<polygon.points.length-1;i++) {
        // if distance to line a-b < 7
        var p = {x: x,y: y};
        var p1 = {x: polygon.points[i][0],y: polygon.points[i][1]};
        var p2 = {x: polygon.points[i+1][0],y: polygon.points[i+1][1]};
        if( distanceOfPointFromLine(p,p1,p2)<7 ) {
          // insert point between a and b
          point = new Circle(x,y,7);
          polygon.points.splice(i+1,0,[x,y,point]);
          point.index = i+1;
          for(var j=i+2;j<polygon.points.length;j++) {
            polygon.points[j][2].index++;
          }
          OpenForum.debug( "Inserted at "+(i+1)+" distance:"+distanceOfPointFromLine(p,p1,p2) );

          // and break
          break;
        }
      }
    }

    if( point===null) { // not on line
      polygon.addPoint(x,y);
      point = new Circle(x,y,7);
      point.index = polygon.points.length-1;
      polygon.points[polygon.points.length-1][2] = point;
      OpenForum.debug( "Added at "+point.index );
    }

    layer.add(point);
    giraffeCanvas.makeDraggable(point);

    point.onClick = function() {
      if(Giraffe.Interactive.controlKeyDown===true) {
        removePoint(point);
        if(element) element.style.cursor="auto";
        Giraffe.busy=false;
      }
    };

    point.onMouseOut = function() {
      if(element) element.style.cursor="auto";
      Giraffe.busy=false;
    };

    point.onMouseOver = function() {
      if(Giraffe.Interactive.shiftKeyDown===false) {
        if(element) element.style.cursor="crosshair";
        Giraffe.busy = true;
      }
    };
  };

  var removePoint = function(point) {
    layer.remove(point);
    polygon.points.splice(point.index,1);
    for(var i=point.index;i<polygon.points.length;i++) {
      polygon.points[i][2].index--;
    }
    OpenForum.debug( "Deleted at "+point.index );
  };

  var distanceOfPointFromLine = function(p, p1, p2) {
    var A = p.x - p1.x;
    var B = p.y - p1.y;
    var C = p2.x - p1.x;
    var D = p2.y - p1.y;

    var dot = A * C + B * D;
    var len_sq = C * C + D * D;
    var param = -1;
    if (len_sq !== 0) param = dot / len_sq;

    var xx, yy;

    if (param < 0) {
      xx = p1.x;
      yy = p1.y;
    } else if (param > 1) {
      xx = p2.x;
      yy = p2.y;
    } else {
      xx = p1.x + param * C;
      yy = p1.y + param * D;
    }

    var dx = x - xx;
    var dy = y - yy;
    return Math.sqrt(dx * dx + dy * dy);
  };

  self.getView = function() {
    return layer;
  };

  self.addPoint = addPoint;

  self.getPoints = function() {
    return polygon.points;
  };
};