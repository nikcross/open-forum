if(!OpenForum) {
  OpenForum = {};
}

OpenForum.Keyboard = function() {
  var self = this;
  var ALPHABET_KEYBOARD = [
    "qwertyuiop",
    "asdfghjkl",
    "zxcvbnm"
  ];

  var DIGIT_KEYBOARD = [
    "123","456","789","0"
  ];

  var MULTIPLE_CHOICE = [
    "ABCDEFGHIJ"
  ];

  var oldKeyDown = null;
  var cursor = null;
  var typedView = null;
  var typedField = null;
  var typed = "";
  var typingOn = true;

  var keyDown = function(e) {
    var  pressedKey;

    if (document.all) { e = window.event;
                       pressedKey = e.keyCode; }
    if (e.which) {
      pressedKey = e.which;
    }

    if(pressedKey >= 96 && pressedKey <= 105) { // number pad
      pressedKey = pressedKey-48;
    }

    if(pressedKey==8) {
      self._keyPress("del");
    } else {
      self._keyPress(String.fromCharCode(pressedKey).toLowerCase());
    }

    if(oldKeyDown) {
      oldKeyDown(e);
    }
  };

  self.setTypedView = function(elementId) {
    typedView = document.getElementById(elementId);
  };

  self.setTypedField = function(elementId) {
    typedField = document.getElementById(elementId);
  };

  self.bindRealKeyboard = function() {
    oldKeyDown = document.onkeydown;
    document.onkeydown = keyDown;
  };

  self.appendTyped = function(text) {
    if(typedField) {
      var start = typedField.value.substring(0,typedField.selectionEnd);
      var end = typedField.value.substring(typedField.selectionEnd);
      typedField.value = start + text + end;
    }
    if(typedView) typedView.innerHTML += text;
  };

  self.getTyped = function() {
    return typed;
  };

  self.clearTyped = function() {
    typed = "";
    if(typedView) {
      typedView.innerHTML = "";
    }

    if(typedField) {
      typedField.value="";
    }
  };

  self.setTypingOn = function(state) {
    typingOn = state;
  };

  self.createAlphabetKeyboard = function(elementId) {
    var keyboardHtml = "";
    for(var ri in ALPHABET_KEYBOARD) {
      var row = ALPHABET_KEYBOARD[ri];
      for(var ki=0; ki<row.length; ki++) {
        var key = row[ki];
        keyboardHtml+="<a class=\"button round\" onclick=\"OpenForum.Keyboard._keyClicked('"+key+"');\">"+key+"</a>&nbsp;";
      }
      keyboardHtml+="<br/>";
    }
    keyboardHtml+="<a class=\"button round\" onclick=\"OpenForum.Keyboard._keyClicked(' ');\" style=\"width: 8em;\">SPACE</a>&nbsp;";

    document.getElementById(elementId).innerHTML = keyboardHtml;
  };

  self.createKeyboard = function(elementId,keyArray) {
    var keyboardHtml = "";
    for(var ri in keyArray) {
      var row = keyArray[ri];
      for(var ki=0; ki<row.length; ki++) {
        var key = row[ki];
        keyboardHtml+="<a class=\"button round\" onclick=\"OpenForum.Keyboard._keyClicked('"+key+"',this);\">"+key+"</a>&nbsp;";
      }
      keyboardHtml+="<br/>";
    }

    document.getElementById(elementId).innerHTML = keyboardHtml;
  };

  self.createDigitKeyboard = function(elementId) {
    var keyboardHtml = "";
    for(var ri in DIGIT_KEYBOARD) {
      var row = DIGIT_KEYBOARD[ri];
      for(var ki=0; ki<row.length; ki++) {
        var key = row[ki];
        keyboardHtml+="<a class=\"button round\" onclick=\"OpenForum.Keyboard._keyClicked('"+key+"');\">"+key+"</a>&nbsp;";
      }
      keyboardHtml+="<br/>";
    }

    document.getElementById(elementId).innerHTML = keyboardHtml;
  };

  self.createMultipleChoiceKeyboard = function(elementId,choices) {
    if(!choices) { 
      choices = 4;
    }
    if(choices>10) {
      choices = 10;
    }

    var keyboardHtml = "";
    for(var ri in MULTIPLE_CHOICE) {
      var row = MULTIPLE_CHOICE[ri];
      for(var ki=0; ki<row.length; ki++) {
        if(ki>=choices) break;
        var key = row[ki];
        keyboardHtml+="<a class=\"button round\" onclick=\"OpenForum.Keyboard._keyClicked('"+key+"');\">"+key+"</a>&nbsp;";
      }
      keyboardHtml+="<br/>";
    }

    document.getElementById(elementId).innerHTML = keyboardHtml;
  };

  self.addKey = function(elementId,display,key) {
    if(key.length>1) {
      if(key.charAt(0) == "=") {
        var fn = key.substring(1);
        document.getElementById(elementId).innerHTML += "<a class=\"button round\" onclick=\"OpenForum.Keyboard."+fn+"; return false;\">"+display+"</a>&nbsp;";
      } else {
        document.getElementById(elementId).innerHTML += "<a class=\"button round\" onclick=\"OpenForum.Keyboard.appendTyped('"+key+"');\">"+display+"</a>&nbsp;";
      }
    } else {
      document.getElementById(elementId).innerHTML += "<a class=\"button round\" onclick=\"OpenForum.Keyboard._keyClicked('"+key+"');\">"+display+"</a>&nbsp;";
    }
  };

  self.addRow = function(elementId) {
    document.getElementById(elementId).innerHTML += "<br/>";
  };

  self.createCursor = function(elementId) {
    var cursorElement = document.getElementById(elementId);
    cursorElement.innerHTML = "_";
    cursor = {element: cursorElement, typeingOn: true};
    setInterval(
      function() {
        if(typingOn===false) {
          cursor.element.style.backgroundColor="white";
        } else {
          var bg = cursor.element.style.backgroundColor;
          if(bg=="white") {
            cursor.element.style.backgroundColor="lightgreen";
          } else {
            cursor.element.style.backgroundColor="white";
          }
        }
      },
      500,500);
  };

  self._keyClicked = function(key) {
    if(typedField) {
      //typedField.value += key;
      self.appendTyped( key );
    } else {
      self._keyPress(key);
    }
  };

  self._keyPress = function(key) {
    if(typingOn===false) {
      return;
    }

    if(key=="space") {
      key =" ";
    }
    if(key=="del") {
      if(typed.length>0) {
        typed = typed.substring(0,typed.length-1);
      }
    } else {
      typed += key;
    }
    if(typedView) typedView.innerHTML = typed.replace(/\s/g,"&nbsp;");

    self.keyPress(key);
  };

  self.keyPress = function(key) {
    console.log("Key "+key+" pressed. Typed:"+typed);
  };

};

OpenForum.Keyboard = new OpenForum.Keyboard();