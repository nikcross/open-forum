var GameConsole = new function() {
  var self = this;
  this.game = null;
  var gameInt = null;
  var interval = null;
  var initialised = false;
  var running = false;
  var frame = 0;

  var upButton = { pressed: false, mapping: "A"};
  var downButton = { pressed: false, mapping: "Z"};
  var leftButton = { pressed: false, mapping: "N"};
  var rightButton = { pressed: false, mapping: "M"};
  var startButton = { pressed: false, mapping: "S"};
  var buttonA = { pressed: false, mapping: " " };
  var buttonB = { pressed: false, mapping: "X"};
  var buttons = [upButton,downButton,leftButton,rightButton,
                 startButton,buttonA,buttonB];

  this.upButtonPressed = function() { return upButton.pressed; };
  this.downButtonPressed = function() { return downButton.pressed; };
  this.leftButtonPressed = function() { return leftButton.pressed; };
  this.rightButtonPressed = function() { return rightButton.pressed; };
  this.buttonAPressed = function() { return buttonA.pressed; };
  this.buttonBPressed = function() { return buttonB.pressed; };
  this.startButtonPressed = function() { return startButton.pressed; };

  this.keyDownHandler = function(e) {
    var pressedKey;
    if (document.all) { e = window.event;
      pressedKey = e.keyCode;
    }
    if (e.which) {
      pressedKey = e.which;
    }
    keyChar = String.fromCharCode(pressedKey);

    for(var buttonIndex in buttons) {
      button = buttons[buttonIndex];
      if(keyChar==button.mapping) {
        button.pressed = true;
      }
    }

    if(initialised===true && running===false && self.startButtonPressed()) {
      self.startGame();
    }
  };

  this.keyUpHandler = function(e) {
    var pressedKey;
    if (document.all) { e = window.event;
      pressedKey = e.keyCode;
    }
    if (e.which) {
      pressedKey = e.which;
    }
    keyChar = String.fromCharCode(pressedKey);

    for(var buttonIndex in buttons) {
      button = buttons[buttonIndex];
      if(keyChar==button.mapping) {
        button.pressed = false;
      }
    }
  };

  this.press = function(buttonName) {
    eval(buttonName+".pressed=true");
    console.log( buttonName+" pressed");
  };

  this.release= function(buttonName) {
    eval(buttonName+".pressed=false");
    console.log( buttonName+" released");
  };

  this.setGame = function(newGame) {
    this.game = newGame;
    gameInt = newGame;
    println("Game Console Game Set");
  };

  this.run = function() {
    this.initialise();
    if(gameInt) {
      gameInt.initialise();
    }
  };
  this.initialise = function() {
    document.onkeydown = GameConsole.keyDownHandler;
    document.onkeyup = GameConsole.keyUpHandler;
    initialised = true;
    frame = 0;
    setStatus("Game Console Initialised");
  };

  this.startGame = function() {
    if(gameInt) {
      gameInt.startGame();
    }
    interval = setInterval(GameConsole.processFrame,10);

    setStatus("Game Console Game Started");
  };

  this.processFrame = function() {
    frame++;
    setStatus("Game Running Frame "+frame);
    if(gameInt) {
      gameInt.processFrame.call(gameInt);
    }
  };

  this.endGame = function() {
    clearInterval(interval);
    if(gameInt) {
      gameInt.endGame();
    }
    setStatus("Game Stopped");
  };

  this.askForName = function() {
  };

  var displayTimer;
  this.displayMessage = function(title,message,time) {
    //TODO
    if(!title) {
      title = message;
      message = "";
    }
    if(time) {
      displayTimer = setTimeout(GameConsole.hideMessage,time*1000);
    }
  };

  this.hideMessage = function() {
    //TODO
  };

  this.displayPage = function(pageName) {
  };
};

function GraphicsObject(xin,yin,idin) {
  var x=xin;
  var y=yin;
  var visible = true;
  var id=idin;
  var el = document.getElementById(id);

  this.getX = function() {
    return x;
  };
  this.getY = function() {
    return y;
  };
  this.setX = function(nx) {
    x=nx;
  };
  this.setY = function(ny) {
    y=ny;
  };

  this.setPosition = function(position) {
    x = position[0];
    y = position[1];
  };

  this.getPosition = function() {
    return [x,y];
  };

  this.update = function() {
    if(visible) {
      el.style.display = "block";
    } else {
      el.style.display = "none";
    }
    el.style.left = x;
    el.style.top = y;
  };
}

function Animation() {
  var sequence = [];
}

function Frame() {
  var fDiv;
  var fImg;
  var sprite;
  var offsetX;
  var offsetY;
  var visible=true;

  this.setVisible = function(state) {
    visible=state;
    if(fDiv) {
      if(state===true) {
        fDiv.style.display = "block";
      } else {
        fDiv.style.display = "none";
      }
    }
    return this;
  };
  this.setSprite = function(newSprite) {
    sprite = newSprite;
    if(fImg) {
      fImg.src = sprite;
    }
    return this;
  };

  this.setX = function(x) {
    offsetX = x;
    if(fDiv) {
      fDiv.style.left = x;
    }
    return this;
  };

  this.getX = function() {
    return offsetX;
  };

  this.setY = function(y) {
    offsetY = y;
    if(fDiv) {
      fDiv.style.top = y;
    }
    return this;
  };

  this.getY = function() {
    return offsetY;
  };

  this.initialise = function(id) {
    fDiv = document.createElement('div');
    fDiv.id = id;
    fDiv.className = 'frame';
    fDiv.style.top = offsetY;
    fDiv.style.left = offsetX;
    fImg = document.createElement('img');
    fImg.src = sprite;
    fDiv.appendChild(fImg);
    this.setVisible(visible);
    document.getElementsByTagName('body')[0].appendChild(fDiv);

    return this;
  };
}

var soundEngine = new function() {
  var sounds = [];

  this.addSound = function(source,id) {
    sound = document.createElement('audio');
    sound.src = source;
    sounds[id] = [source,sound];
  };

  this.playSound = function(id) {
    sounds[id][1].loop=false;
    sounds[id][1].play();
  };

  this.loopSound = function(id) {
    sounds[id][1].loop=true;
    sounds[id][1].play();
  };
};

var Game = function() {
		this.initialise = function(){};
		this.startGame = function(){};
        this.processFrame = function(){};
        this.endGame = function(){};
 };

function setStatus(status) {
  document.getElementById("status").innerHTML = status;
}

function println(message) {
  console.log(message);
}

