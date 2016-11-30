OpenForum.includeScript("/OpenForum/Javascript/Keyboard/Keyboard.js");

OpenForum.init = function() {
  OpenForum.Keyboard.createAlphabetKeyboard("keyboard");
  OpenForum.Keyboard.createDigitKeyboard("numberPad");
  OpenForum.Keyboard.createMultipleChoiceKeyboard("multiPad",5);
  OpenForum.Keyboard.createCursor("cursor");
  OpenForum.Keyboard.setTypedView("typed");
  OpenForum.Keyboard.bindRealKeyboard();
};