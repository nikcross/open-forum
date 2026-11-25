/*

* Author: 
*/
OpenForum.includeScript("/OpenForum/Giraffe/giraffe.js");

OpenForum.init = function() {
  canvas = new Canvas("canvas");
  Giraffe.Interactive.setInteractive(canvas);
  Giraffe.setAnimated(canvas);
  canvas.startAnimation(15,100,true);

  drawKeyboard();
};

var keys = [];
keys[0] = "|1234567890-=";
keys[1] = "  qwertyuiop[]";
keys[2] = "  asdfghjkl;'#";
keys[3] = "  \\zxcvbnm,./";

var shift = [];
shift[0] = "|!\"p$%^&*()_+";
shift[1] = "  QWERTYUIOP{}";
shift[2] = "  ASDFGHJKL:@~";
shift[3] = "  |ZXCVBNM<>?";

var caps = [];
caps[0] = "|1234567890-=";
caps[1] = "  QWERTYUIOP[]";
caps[2] = "  ASDFGHJKL;'#";
caps[3] = "  \\ZXCVBNM,./";

function Font(style,face,size) {
  this.style=style;
  this.face=face;
  this.size=size;

  this.toString = function() {
    return style+" "+size+"px"+" "+face;
  };
}

var keyStyle = {
  backgroundColor: "lightgreen",
  borderColor: "blue",
  downColor: "purple",
  textColor: "black",
  textFont: new Font("italic","Arial",12).toString(),
  textSuperFont: new Font("italic","Arial",10).toString()
};

function makeKey(keyPad) {
  keyPad.down=false;
  keyPad.onMousePressed = function(x,y) {
    this.background.setFillColor(keyStyle.downColor);
    this.down=true;
    if(shiftKey.toggled===true) {
      sendKey(this.shift);
    } else if(capsKey.toggled===true) {
      sendKey(this.caps);
    } else {
      sendKey(this.key);
    }
  };
  keyPad.onMouseReleased = function(x,y) {
    this.background.setFillColor(keyStyle.backgroundColor);
    if(this.down===true) {
      this.down=false;
      shiftKey.releaseKey();
      altKey.releaseKey();
      ctrlKey.releaseKey();
    }
  };
}

function makeToggleKey(keyPad) {
  keyPad.toggled = false;

  keyPad.releaseKey = function() {
    this.toggled=false;
    this.background.setFillColor(keyStyle.backgroundColor);
  }
  keyPad.onMousePressed = function(x,y) {
    if(keyPad.toggled==true) {
      this.toggled=false;
      this.background.setFillColor(keyStyle.backgroundColor);
    } else {
      this.toggled=true;
      this.background.setFillColor(keyStyle.downColor);
    }
  }
  keyPad.onMouseReleased = function(x,y) {
  }
}

var shiftKey;
var altKey;
var ctrlKey;
var capsKey;

function drawKeyboard() {
  for(row=0;row<keys.length;row++) {
    for(key=0;key<keys[row].length;key++) {
      keyPad = new Composite(key*30,row*30);
      keyPad.background = new Rectangle(0,0,26,26).setFillColor(keyStyle.backgroundColor).setColor(keyStyle.borderColor)
      keyPad.add( keyPad.background );
      if(keys[row].charAt(key)==" ") {
        continue;
      } else if(shift[row].charAt(key)==" ") {
        keyPad.add( new Text(5,18,keys[row].charAt(key),15,keyStyle.textFont).setFillColor(keyStyle.textColor) );
      } else {
        keyPad.add( new Text(4,20,keys[row].charAt(key),15,keyStyle.textFont).setFillColor(keyStyle.textColor) );
        keyPad.add( new Text(14,15,shift[row].charAt(key),12,keyStyle.textSuperFont).setFillColor(keyStyle.textColor) );
      }
      keyPad.key=keys[row].charAt(key);
      keyPad.shift=shift[row].charAt(key);
      keyPad.caps=caps[row].charAt(key);
      makeKey(keyPad);

      canvas.add(keyPad);
    }
  }
  keyPad = new Composite(120,120);
  keyPad.background = new Rectangle(0,0,236,26).setFillColor(keyStyle.backgroundColor).setColor(keyStyle.borderColor);
  keyPad.add( keyPad.background );
  keyPad.add( new Text(5,18,"SPACE",15,keyStyle.textFont).setFillColor(keyStyle.textColor) )
  keyPad.key=" ";
  keyPad.shift=" ";
  makeKey(keyPad);
  canvas.add(keyPad);

  keyPad = new Composite(0,30);
  keyPad.background = new Rectangle(0,0,56,26).setFillColor(keyStyle.backgroundColor).setColor(keyStyle.borderColor);
  keyPad.add( keyPad.background );
  keyPad.add( new Text(5,18,"TAB",15,keyStyle.textFont).setFillColor(keyStyle.textColor) );
  keyPad.key="\t";
  keyPad.shift="\t";
  makeKey(keyPad);
  canvas.add(keyPad);

  keyPad = new Composite(390,0);
  keyPad.background = new Rectangle(0,0,26,26).setFillColor(keyStyle.backgroundColor).setColor(keyStyle.borderColor);
  keyPad.add( keyPad.background );
  keyPad.add( new Text(5,18,"Bk",15,keyStyle.textFont).setFillColor(keyStyle.textColor) );
  makeKey(keyPad);
  canvas.add(keyPad);

  keyPad = new Composite(0,60);
  keyPad.background = new Rectangle(0,0,56,26).setFillColor(keyStyle.backgroundColor).setColor(keyStyle.borderColor);
  keyPad.add( keyPad.background );
  keyPad.add( new Text(5,18,"CAPS",15,keyStyle.textFont).setFillColor(keyStyle.textColor) );
  makeToggleKey(keyPad);
  canvas.add(keyPad);
  capsKey = keyPad;

  keyPad = new Composite(0,90);
  keyPad.background = new Rectangle(0,0,56,26).setFillColor(keyStyle.backgroundColor).setColor(keyStyle.borderColor)
  keyPad.add( keyPad.background );
  keyPad.add( new Text(5,18,"Shift",15,keyStyle.textFont).setFillColor(keyStyle.textColor) );
  makeToggleKey(keyPad);
  canvas.add(keyPad);
  shiftKey = keyPad;

  keyPad = new Composite(0,120);
  keyPad.background = new Rectangle(0,0,56,26).setFillColor(keyStyle.backgroundColor).setColor(keyStyle.borderColor);
  keyPad.add( keyPad.background );
  keyPad.add( new Text(5,18,"Ctrl",15,keyStyle.textFont).setFillColor(keyStyle.textColor) );
  makeToggleKey(keyPad);
  canvas.add(keyPad);
  ctrlKey = keyPad;

  keyPad = new Composite(60,120);
  keyPad.background = new Rectangle(0,0,56,26).setFillColor(keyStyle.backgroundColor).setColor(keyStyle.borderColor);
  keyPad.add( keyPad.background );
  keyPad.add( new Text(5,18,"Alt",15,keyStyle.textFont).setFillColor(keyStyle.textColor) );
  makeToggleKey(keyPad);
  canvas.add(keyPad);
  altKey = keyPad;

  keyPad = new Composite(390,90);
  keyPad.background = new Polygon(0,0);
  keyPad.background.addPoint(0,0);
  keyPad.background.addPoint(26,0);
  keyPad.background.addPoint(26,56);
  keyPad.background.addPoint(-30,56);
  keyPad.background.addPoint(-30,30);
  keyPad.background.addPoint(0,30);
  keyPad.background.setFillColor(keyStyle.backgroundColor).setColor(keyStyle.borderColor);
  keyPad.add( keyPad.background );
  keyPad.add( new Text(-25,48,"RETURN",12,keyStyle.textSuperFont).setFillColor(keyStyle.textColor) );
  keyPad.key="\n";
  keyPad.shift="\n";
  makeKey(keyPad);
  canvas.add(keyPad);
}

function sendKey(key) {
  console.log("Send "+key);
}