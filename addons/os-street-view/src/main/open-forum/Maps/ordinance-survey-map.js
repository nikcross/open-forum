var OSMap = new function() {
  var cells = [
    
    	["sv","sw","sx","sy","sz","tv","tw"],
    	["sq","sr","ss","st","su","tq","tr"],
    	["sl","sm","sn","so","sp","tl","tm"],
    	["sf","sg","sh","sj","sk","tf","tg"],
    	["sa","sb","sc","sd","se","ta","tb"],
    	["nv","nw","nx","ny","nz","ov","ow"],
    	["nq","nr","ns","nt","nu","oq","or"],
    	["nl","nm","nn","no","np","ol","om"],
    	["nf","ng","nh","nj","nk","of","og"],
    	["na","nb","nc","nd","ne","oa","ob"]
    ];
  
  this.getMapOffset = function(lx,ly) {
        var x = lx%10000;
    	var y = 10000-(ly%10000);
    
    if(x<5000) {
      if(y<5000) {
        //sw
        // not action
      } else {
        //nw
        y=y-5000;
      }
    } else {
      if(y<5000) {
        //se
        x=x-5000;
      } else {
        //ne
        x=x-5000;
        y=y-5000;
      }
    }
    
    return [-x,-y];
  };
  
  this.getTile = function(lx,ly) {
    
    var x = Math.floor(lx/1000);
    var y = Math.floor(ly/1000);
    
    var cx = x%10;
    var cy = y%10;
    
    var compass = "";
    if(cx<5) {
      if(cy<5) {
        compass = "sw";
      } else {
        compass = "nw";
      }
    } else {
      if(cy<5) {
        compass = "se";
      } else {
        compass = "ne";
      }
    }
    
    var dx = Math.floor(x/10)%10;
    var dy = Math.floor(y/10)%10;
    
    var lx = Math.floor(x/100);
    var ly = Math.floor(y/100);
    
    var tile = cells[ly][lx]+dx+dy+compass+".png";
    
    return tile;
  };
  
  var pad = function(string) {
    while(pad.length<10) {
      pad = "0"+pad;
    }
  };
};


