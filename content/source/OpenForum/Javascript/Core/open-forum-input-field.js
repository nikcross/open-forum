if(!OpenForum) {
  OpenForum = {};
}

OpenForum.Input={};

OpenForum.Input.getText = function(elementId) {
  var input = document.getElementById( elementId );
  return input.value;
};

OpenForum.Input.getSelectedText = function(elementId) {
  var input = document.getElementById( elementId );
  return input.value.substring(input.selectionStart,input.selectionEnd);
};

OpenForum.Input.hasSelection = function(elementId) {
  var input = document.getElementById( elementId );
  return input.selectionStart != input.selectionEnd;
};

OpenForum.Input.wrapSelectedText = function ( elementId, startText, endText ) {
  var input = document.getElementById( elementId );
  var text = input.value.substring(input.selectionStart,input.selectionEnd);
  var start = input.value.substring(0,input.selectionStart);
  var end = input.value.substring(input.selectionEnd);
  input.value = start + startText + text + endText + end;
};

OpenForum.Input.wrapAllText = function ( elementId, startText, endText ) {
  var input = document.getElementById( elementId );
  var text = input.value;
  input.value = startText + text + endText;
};

OpenForum.Input.replaceSelectedText = function ( elementId, replaceWith ) {
  var input = document.getElementById( elementId );
  var start = input.value.substring(0,input.selectionStart);
  var end = input.value.substring(input.selectionEnd);
  input.value = start + replaceWith + end;
};

OpenForum.Input.appendAtCursor = function ( elementId, text ) {
  var input = document.getElementById( elementId );
  var start = input.value.substring(0,input.selectionEnd);
  var end = input.value.substring(input.selectionEnd);
  input.value = start + text + end;
};

OpenForum.Input.toDateField = function ( date ) {
  var value = date.getFullYear()+"-"+(""+(date.getMonth()+1)).padBefore("0",2)+"-"+(""+date.getDate()).padBefore("0",2);
  return value;
};

OpenForum.Input.toDateTimeField = function ( date ) {
  var value = date.getFullYear()+"-"+(""+(date.getMonth()+1)).padBefore("0",2)+"-"+(""+date.getDate()).padBefore("0",2);
  value += "T" + (""+date.getHours() ).padBefore("0",2) + ":" + (""+date.getMinutes() ).padBefore("0",2);
  return value;
};

OpenForum.Input.fromDateField = function ( value ) {
  var parts = value.split("-");
  var newDate = new Date(parts[0], parseInt(parts[1],10)-1, parts[2], 0, 0, 0, 0);
  return newDate;
};

OpenForum.Input.fromDateTimeField = function ( value ) {
  var parts = value.before("T").split("-");
  var newDate = new Date(parts[0], parseInt(parts[1],10)-1, parts[2], 0, 0, 0, 0);
  
  parts = value.after("T").split(":");
  newDate.setHours( parseInt( parts[0] ) );
  newDate.setMinutes( parseInt( parts[1] ) );
  
  return newDate;
};
