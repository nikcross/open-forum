/*

* Author: 
*/
OpenForum.includeScript("/OpenForum/Giraffe/giraffe.js");

var shadow;
var blocks = [];var ball;
var width = 800;
var height = 600;
var X=0,Y=1;
var paddle;
var backDrop = 2;

OpenForum.init = function() {
  shadow = new Shadow();

  canvas = new Canvas("canvas");
  Giraffe.Interactive.setInteractive(canvas);
  Giraffe.setAnimated(canvas);
  canvas.startAnimation(30,100,true);

  drawBlocks();
  mapKeys();
  initGame();
};

function mapKeys() {
  window.onkeyup = function(event) {
    ship.thruster.visible = false;
    ship.leftThruster.visible = false;
    ship.rightThruster.visible = false;
    ship.reverseThruster.visible = false;
    reverseButton.setFillColor("red");
  };

  window.onkeydown = function(e) {
    var code = e.keyCode ? e.keyCode : e.which;

    key = code;

    if(code==188) { // <
      paddleLeft();
    } else if(code==190) { // >
      paddleRight();
    }
  };
  
    window.onkeyup = function(e) {
      paddleStop();
    };
}

function paddleLeft() {
  paddle.vx=-10;
}

function paddleRight() {
  paddle.vx=10;
}

function paddleStop() {
  paddle.vx=0;
}

function drawBlocks() {
  back = new Composite(0,0);

  for(var i=0;i<20;i++) {
    blocks[i] = [];
    for(var j=0;j<10;j++) {
      block = new Rectangle(40*i,50+(20*j),39,19);
      block.setColor("blue");
      block.setFillColor("lightblue");
      block.width = 40;
      block.height = 20;
      back.add( block );
      blocks[i][j] = block;
    }
  }
  canvas.add(back);
}

function initGame() {
  paddle = new Rectangle(width/2,height-40,80,20).setFillColor("green");

  paddle.onMouseOver = function() {
    paddle.y = height-40;
    if(paddle.x<0) {
      paddle.x=0;
    }
    if(paddle.x>width-80) {
      paddle.x=width-80;
    }
  };
  paddle.setShadow(shadow);
  paddle.vx = 0;
  paddle.animate = function() {
    paddle.x+=paddle.vx;
    if(paddle.x>720) {
      paddle.x=720;
    }
    if(paddle.x<0) {
      paddle.x=0;
    }
  };

  canvas.add(paddle);
  canvas.makeDraggable(paddle);

  ball = new Circle(width/2,height-50,10).setFillColor("red");
  ball.setShadow(shadow);
  ball.velocity = [-5,-5];
  ball.radius = 10;
  ball.animate = function(frame) {
    if(frame%100==0) {
      back.y+=backDrop;
      backDrop++;
    }

    ball.x+=ball.velocity[X];
    ball.y+=ball.velocity[Y];

    if(ball.x<=ball.radius) {
      ball.velocity[X] = -ball.velocity[X];
    }
    if(ball.y<=ball.radius) {
      ball.velocity[Y] = -ball.velocity[Y];
    }
    if(ball.x>width-ball.radius) {
      ball.velocity[X] = -ball.velocity[X];
    }
    if(ball.y>height-ball.radius) {
      ball.velocity[Y] = -ball.velocity[Y];
    }

    testX = ball.x+ball.velocity[X]-paddle.x;
    testY = ball.y+ball.velocity[Y]-paddle.y;

    if(testX>0-ball.radius && testX<80+ball.radius) {
      if(testY>0-ball.radius && testY<20+ball.radius) {
        if(testY<0 || testY>20) {
          ball.velocity[Y] = -ball.velocity[Y];
        }
        else if(testX<0 || testX>40) {
          ball.velocity[X] = -ball.velocity[X];
        }
      }
    }

    for(var i=0;i<20;i++) {
      for(var j=0;j<10;j++) {
        block = blocks[i][j];

        testX = ball.x+(ball.velocity[X]/2)-block.x;
        testY = ball.y+(ball.velocity[Y]/2)-(block.y+back.y);

        radius = ball.radius;
        if(testX>0-radius && testX<40+radius) {
          if(testY>0-radius && testY<20+radius) {
            if(block.visible==false) {
              continue;
            }

            if(testY<0 && testX<0 && ball.velocity[X]>0 && ball.velocity[Y]>0) {
              ball.velocity[X] = -ball.velocity[X];
              block.visible=false;
            } else if(testY>20 && testX<0 && ball.velocity[X]>0 && ball.velocity[Y]<0) {
              ball.velocity[X] = -ball.velocity[X];
              block.visible=false;
            } else if(testY>20 && testX>40 && ball.velocity[X]<0 && ball.velocity[Y]>0) {
              ball.velocity[Y] = -ball.velocity[Y];
              block.visible=false;
            } else if(testY>20 && testX>40 && ball.velocity[X]<0 && ball.velocity[Y]<0) {
              ball.velocity[Y] = -ball.velocity[Y];
              block.visible=false;
            } else if(testY<0 || testY>20) {
              ball.velocity[Y] = -ball.velocity[Y];
              block.visible=false;
            } else if(testX<0 || testX>40) {
              ball.velocity[X] = -ball.velocity[X];
              block.visible=false;
            }
          }
        }
      }
    }

  };

  canvas.add(ball);
}