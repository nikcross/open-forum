/*
* Author: 
*/
OpenForum.includeScript("/OpenForum/Giraffe/giraffe.js");

OpenForum.init = function() {
  canvas = new Canvas("canvas");
  Giraffe.Interactive.setInteractive(canvas);
  Giraffe.setAnimated(canvas);
  canvas.startAnimation(30,100,true);

  drawLayers();
};


var offsetX=125;
var offsetY=83;
var scale=1.235;
var zoom=8;
var cell = [];
var data = [];

function drawLayers() {

  mapWindow = new Composite(-256,-256);
  map = new Composite(0,0);
  title = new Text(0,20,offsetX+","+offsetY,30);
  title.setFillColor("blue");
  canvas.add( title );

  for(cx=0;cx<5;cx++) {
    cell[cx] = [];
    data[cx] = [];
    for(cy=0;cy<5;cy++) {
      cell[cx][cy] = new Picture(cx*256,cy*256,"http://www.rensmart.com/OpenForum/Images/rensmart-transparent-small.png");

      map.add(cell[cx][cy]);
      //map.add( new Rectangle(cx*256,cy*256,256,256) );
      //data[cx][cy] = new Text(cx*256,(cy*256)+20,(cx)+","+(cy),20);
      //map.add( data[cx][cy] );
    }
  }	
  updateMap();

  canvas.makeDraggable(map);
  mapWindow.add( new Rectangle(256,256,768,768).setFillColor("black") );
  mapWindow.add(map);
  canvas.add(mapWindow);

  zoomInButton = new Rectangle(20,60,20,20);
  zoomInText = new Text(25,77,"+",20);
  zoomInText.setColor("white");
  zoomInButton.setFillColor("blue");
  zoomInButton.onMousePressed = function() {
    this.active=true;
  };
  zoomInButton.onMouseReleased = function() {
    this.active=false;
  };
  zoomInButton.animate = function() {
    if(this.active===true) {
      zoomIn();
    }
  };

  zoomOutButton = new Rectangle(20,100,20,20);
  zoomOutText = new Text(27,115,"-",20);
  zoomOutText.setColor("white");
  zoomOutButton.setFillColor("blue");
  zoomOutButton.onMousePressed = function() {
    this.active=true;
  };
  zoomOutButton.onMouseReleased = function() {
    this.active=false;
  };
  zoomOutButton.animate = function() {
    if(this.active===true) {
      zoomOut();
    }
  };

  canvas.add(zoomInButton);
  canvas.add(zoomInText);
  canvas.add(zoomOutButton);
  canvas.add(zoomOutText);

  cell[0][0].animate = function(frame) {
    if(map.x>256) {
      map.x=0;
      map.dragStart[0]-=256;
      offsetX--;
      updateMap();
    }
    if(map.y>256) {
      map.y=0;
      map.dragStart[1]-=256;
      offsetY--;
      updateMap();
    }
    if(map.x<-256) {
      map.x=0;
      map.dragStart[0]+=256;
      offsetX++;
      updateMap();
    }
    if(map.y<-256) {
      map.y=0;
      map.dragStart[1]+=256;
      offsetY++;
      updateMap();
    }

    title.text = map.x+","+map.y+" "+new Date();
  };
}

function updateMap() {
  for(cx=0;cx<5;cx++) {
    for(cy=0;cy<5;cy++) {
      cell[cx][cy].img = getImage((cx+offsetX),(cy+offsetY),zoom);
      //data[cx][cy].text = (cx+offsetX)+","+(cy+offsetY);
    }
  }
}

function zoomIn() {
  scale+=0.005;
  if(scale>1.3) {
    scale=1;	
    zoom++;
    offsetX=Math.floor((offsetX*2)+2);
    offsetY=Math.floor((offsetY*2)+2);
    updateMap();
  }
  map.scaleX=scale;
  map.scaleY=scale;
}

function zoomOut() {
  scale-=0.005;
  if(scale<1.0) {
    scale=1.3;
    zoom--;
    offsetX=Math.floor((offsetX-2)/2);
    offsetY=Math.floor((offsetY-2)/2);
    updateMap();
  }
  map.scaleX=scale;
  map.scaleY=scale;
}

var imageCache = [];
function getImage(x,y,z) {
  if(x<0) {
    x=0;
  }
  if(y<0) {
    y=0;
  }
  key = x+":"+y+":"+z;
  if( typeof(imageCache[key])=="undefined" ) {
    imageCache[key] =  new Image();
    //imageCache[key].src="http://tiles.rensmart.com/?x="+x+"&y="+y+"&zoom="+z+"&key=wind-10";
    //imageCache[key].src="http://otile1.mqcdn.com/tiles/1.0.0/sat/"+z+"/"+x+"/"+y+".jpg";
    imageCache[key].src="http://otile1.mqcdn.com/tiles/1.0.0/osm/"+z+"/"+x+"/"+y+".png";
    imageCache[key].src="http://a.tile.openstreetmap.org/"+z+"/"+x+"/"+y+".png";
  }
  return imageCache[key];
}
