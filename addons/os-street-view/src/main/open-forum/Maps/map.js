var canvas;

var locationX = 642500;
var locationY = 317500;

var status;

//============================================================
var MapLayer = function(canvas) {
  
  var features = [];
  var lastFeature = null;
  var track = [];
  
  var trackMode = true;
  
  var blankTile = "/Maps/OSStreetView/blank.png";
  var tileRoot = "/Maps/OSStreetView/tiles";
  var imageWidth = 5000;
  var imageHeight = 5000;
  
  var offsetX = (canvas.width/2)-(imageWidth/2);
  var offsetY = (canvas.height/2)-(imageHeight/2);
  
  var lastMapX = 0;
  var lastMapY = 0;
  
  var dragging = false;
  
  var tile1 = new Picture(	offsetX-imageWidth,     offsetY-imageHeight,  blankTile);
  var tile2 = new Picture(	offsetX,                         offsetY-imageHeight,  blankTile);
  var tile3 = new Picture(	offsetX+imageWidth,    offsetY-imageHeight,  blankTile);
  
  
  var tile4 = new Picture(	offsetX-imageWidth,     offsetY,                       blankTile);
  var tile5 = new Picture(	offsetX,                         offsetY,                       blankTile);
  var tile6 = new Picture(	offsetX+imageWidth,    offsetY,                       blankTile);
  
  var tile7 = new Picture(	offsetX-imageWidth,     offsetY+imageHeight, blankTile);
  var tile8 = new Picture(	offsetX,                         offsetY+imageHeight, blankTile);
  var tile9 = new Picture(	offsetX+imageWidth,    offsetY+imageHeight, blankTile);
  
  var map = new Composite(0,0);
  map.add(tile1);
  map.add(tile2);
  map.add(tile3);
  map.add(tile4);
  map.add(tile5);
  map.add(tile6);
  map.add(tile7);
  map.add(tile8);
  map.add(tile9);
  
  canvas.add(map);

  var origin = new Circle(0,0,5).setFillColor("rgba(0,0,255,0.2)"); 
  map.add(origin);
  
  var center = new Circle((canvas.width/2),(canvas.height/2),5).setFillColor("rgba(0,0,255,0.2)"); 
  canvas.add(center);
  
  canvas.makeDraggable(map);
  canvas.addAnimationListener(this);
  map.onMouseReleased = function(x,y) {
    if(dragging===false) {
      //var os = OSMap.getMapOffset(locationX,locationY);
      var px = locationX + x - (canvas.width/2);
      var py = locationY - y + (canvas.height/2);
      
   		processClick(px,py);
    }
    dragging = false;
  };
  
   var updateTiles = function() {
  
    tile1.img.src = getTile(  locationX-imageWidth,       locationY+imageHeight );
    tile2.img.src = getTile(  locationX,                           locationY+imageHeight );
    tile3.img.src = getTile(  locationX+imageWidth,      locationY+imageHeight );

    tile4.img.src = getTile(  locationX-imageWidth,       locationY );
    tile5.img.src = getTile(  locationX,                           locationY );
     console.log( locationX+" , "+locationY+" = "+getTile(locationX,locationY) );
     console.log("mxy:"+map.x+","+map.y);
     map.lx = locationX+map.x-(screenWidth/2);
     map.ly = locationY-map.y+(screenHeight/2);
    tile6.img.src = getTile(  locationX+imageWidth,      locationY );

    tile7.img.src = getTile(  locationX-imageWidth,       locationY-imageHeight );
    tile8.img.src = getTile(  locationX,                           locationY-imageHeight );
    tile9.img.src = getTile(  locationX+imageWidth,      locationY-imageHeight );
     
        for(var fi in features) {
          placeItem(features[fi]);
        }
        updateTrack();
  };
  
  var getTile = function(x,y) {
    var tileFile = OSMap.getTile(x,y);
    if( OpenForum.file.attachmentExists(tileRoot,tileFile)==="true" ) {
      return tileRoot+"/"+tileFile;
    } else {
      return blankTile;
    }
  };
  //console.log( "Tile 5:" + tile5.img.src );
  
  this.getDebug = function() {
    //return (tile5.img.src).substring(tile5.img.src.lastIndexOf("/"))+" mx:"+map.x+" my:"+map.y;
    return " mx:"+map.x+" my:"+map.y;
  };
  
  this.editWaypoint = function(lx,ly) {
    var nearest = this.findNearestWaypoint(lx,ly);
    console.log( "d:"+nearest.distance );

    if(nearest.distance<6 && nearest.distance>-1) {
      nearest.feature.setFillColor("red");
      canvas.makeDraggable( nearest.feature );
      canvas.setDragging(nearest.feature);
    } else {
      this.addWaypoint(lx,ly);
    }
  };
  
  this.addWaypoint = function(lx,ly) {
    var feature = new Circle(0,0,5).setFillColor("blue");
    feature.data = {lx: lx, ly: ly};
    placeItem(feature);
    features.push(feature);
    map.add(feature);
    
    if(trackMode===true) {
      if(lastFeature!==null) {
        var step = new Line(feature.x,feature.y,lastFeature.x-feature.x,lastFeature.y-feature.y)
            .setColor("blue")
            .setLineStyle(  {thickness: 6, endType: "round"}  );
        step.from = lastFeature;
        step.to = feature;
        track.push(step);
        map.add(step);
      }
      lastFeature = feature;
    }
  };
  
  this.findNearestWaypoint = function(lx,ly) {
    var minimumDistance = -1;
    var nearestFeature = null;
    for(var fi in features) {
      var feature  = features[fi];
      var distance = calculateDistance(lx,ly,feature.data.lx,feature.data.ly);
      if(distance<minimumDistance || minimumDistance==-1) {
        nearestFeature = feature;
        minimumDistance = distance;
      }
    }
    return {feature: nearestFeature, distance: minimumDistance};
  };
  
  var calculateDistance = function(lx1,ly1,lx2,ly2) {
    var dx = lx2-lx1;
    var dy = ly2-ly1;
    
    return Math.pow( (dx*dx) + (dy*dy), 0.5 );
  };
  
  var placeItem = function(item) {
    var s = OSMap.getMapOffset(map.lx,map.ly);
    //item.x = (item.data.lx-map.lx)+(imageWidth/2)+s[0]+(screenWidth/2);
    //item.y = (map.ly-item.data.ly)+(imageHeight/2)+s[1]+(screenHeight/2);
    item.x = (item.data.lx-map.lx);
    item.y = (map.ly-item.data.ly);
    console.log("map offx,offy: "+s[0]+" , "+s[1]);
    console.log("map x,y: "+map.x+" , "+map.y);
    console.log("map lx,ly: "+map.lx+" , "+map.ly);
    console.log("item x,y: "+item.x+" , "+item.y);
    console.log("item lx,ly "+item.data.lx+" , "+item.data.ly);
  };
  
  this.updateLocation = function() {
    var s=OSMap.getMapOffset(locationX,locationY);
    map.x = s[0]+(imageWidth/2);
    map.y = s[1]+(imageHeight/2);
    lastMapX = map.x;
    lastMapY = map.y;
    updateTiles();
  };
  
  this.processFrame = function(frame) {

      var dx = 0;
      var dy = 0;

      if(map.x!==lastMapX) {
        dx = map.x-lastMapX;
        locationX -= dx;
        lastMapX = map.x;
        dragging=true;
      }
      if(map.y!==lastMapY) {
        dy = map.y-lastMapY;
        locationY += dy;
        lastMapY = map.y;
        dragging=true;
      }

      var needsUpdate = false;
      if(map.x<-imageWidth || map.x>imageWidth) {
        map.x = map.x%imageWidth;
        lastMapX = map.x;
        needsUpdate=true;
      }

      if(map.y<-imageHeight || map.y>imageHeight) {
        map.y = map.y%imageHeight;
        map.y = 0;
        lastMapY = 0;
        needsUpdate=true;
      }

      if( needsUpdate ) {
        updateTiles();
      }
  };
  
  var updateTrack = function() {
        for(var si in track) {
          var step = track[si];
          step.x = step.to.x;
          step.y = step.to.y;
          step.x2 = step.from.x - step.to.x;
          step.y2 = step.from.y - step.to.y;
        }
  };
  
  this.zoomIn = function() {
    map.scaleX+=0.1;
    map.scaleY+=0.1;
  };
  
  this.zoomOut = function() {
    map.scaleX-=0.1;
    map.scaleY-=0.1;
  };
  
  updateTiles();
};

//===========================================================================

function initMap() {
  canvas =new Canvas("mapCanvas");
  Giraffe.Interactive.setInteractive(canvas);
  canvas.add( new Rectangle(0,0,screenWidth,screenHeight).setFillColor("#003300") );
  Giraffe.setAnimated(canvas);
  mapLayer = new MapLayer(canvas);
  
  canvas.startAnimation(20,100,true);
  
  zoomIn = new Circle(10,100,10);
  zoomIn.onClick = function(x,y) {
    mapLayer.zoomIn();
  };
  
  zoomOut = new Circle(10,130,15);
  zoomOut.onClick = function(x,y) {
    mapLayer.zoomOut();
  };
  
  canvas.add(zoomIn);
  canvas.add(zoomOut);
  
  canvas.add( new Rectangle(5,5,800,35).setFillColor("white").setColor("black") );
  state = new Text(30,30,"Status: ",25,"Arial").setFillColor("#0000cc");
  state.animate = function(frame) {
    state.text = "X:"+locationX+" Y:"+locationY+" Tile:" + mapLayer.getDebug();
  };
  
  canvas.add( state );
  
  mapLayer.updateLocation();
}

function goLatLng() {
  var wgs84 = LatLonE(lat, lng, LatLonE.datum.WGS84);
  var osgb = wgs84.convertDatum(LatLonE.datum.OSGB36);
  var gridref = OsGridRef.latLonToOsGrid(osgb);
  
    locationX = Math.round(gridref.easting);
    locationY = Math.round(gridref.northing);
  
  mapLayer.updateLocation();
}


function goOS() {
  locationX = Math.ceil(east);
  locationY = Math.ceil(north);
  mapLayer.updateLocation();
}

function processClick(px,py) {
  //alert("Clicked :"+px+","+py);
  if(Giraffe.Interactive.controlKeyDown===true) {
    alert("Delete");
  }
  if(Giraffe.Interactive.shiftKeyDown===true) {
    alert("Drag");
  }
  mapLayer.editWaypoint(px,py);
}


