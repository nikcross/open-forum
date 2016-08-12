/*
* Author: 
* Description: 
*/

OpenForum.focusOnSearch = function() { 
  var input = $("#primarySearchField")[0];
  input.selectionStart = input.selectionEnd = input.value.length;
  input.focus();

  setTimeout( function() {
    var input = $("#primarySearchField")[0];
    input.selectionStart = input.selectionEnd = input.value.length;
    input.focus();
  }, 500);
};

OpenForum.search = function(query) {
  OpenForum.clearSearch();

  var cm = currentEditor.editor.getCodeMirror();
  var cursor = cm.getSearchCursor(query);

  OpenForum.currentSearch = {cm: cm, cursor: cursor, query: query};
};

OpenForum.repeatSearch = function() {
  if(OpenForum.currentSearch===null) return;

  var cm = currentEditor.editor.getCodeMirror();
  var cursor = cm.getSearchCursor(OpenForum.currentSearch.query);

  OpenForum.currentSearch = {cm: cm, cursor: cursor, query: OpenForum.currentSearch.query};
};

OpenForum.currentSearch = null;

OpenForum.setReplaceText = function(replaceText) {
  if(OpenForum.currentSearch === null) return;

  OpenForum.currentSearch.replaceText = replaceText;
};

OpenForum.showSearchMatches = function() {
  if(OpenForum.currentSearch === null) return;

  OpenForum.clearSearch();
  var finds = 0;
  while(OpenForum.currentSearch.cursor.findNext()) {
    OpenForum.currentSearch.cm.markText(OpenForum.currentSearch.cursor.from(),OpenForum.currentSearch.cursor.to(),{className: "styled-background"});
    if(finds===0) {
      OpenForum.scrollToLine( OpenForum.currentSearch.cursor.from().line );
    }
    finds++;
  }
  OpenForum.repeatSearch();
  return finds;
};

OpenForum.showNextSearchMatch = function() {
  if(OpenForum.currentSearch === null) return;

  OpenForum.clearSearch();
  if(OpenForum.currentSearch.cursor.findNext()) {
    OpenForum.currentSearch.cm.markText(OpenForum.currentSearch.cursor.from(),OpenForum.currentSearch.cursor.to(),{className: "styled-background"});
    OpenForum.scrollToLine( OpenForum.currentSearch.cursor.from().line );
    return true;
  } else {
    OpenForum.repeatSearch();
    return false;
  }
};

OpenForum.replaceLastMatch = function() {
  if(OpenForum.currentSearch === null) return;
  if(OpenForum.currentSearch.replaceText === null) return;

  OpenForum.currentSearch.cm.replaceRange( OpenForum.currentSearch.replaceText,OpenForum.currentSearch.cursor.from(),OpenForum.currentSearch.cursor.to() );
  OpenForum.showNextSearchMatch();
};

OpenForum.replaceAllMatches = function() {
  if(OpenForum.currentSearch === null) return;
  if(OpenForum.currentSearch.replaceText === null) return;

  OpenForum.clearSearch();
  var finds = 0;
  while(OpenForum.currentSearch.cursor.findNext()) {
    OpenForum.currentSearch.cm.replaceRange( OpenForum.currentSearch.replaceText,OpenForum.currentSearch.cursor.from(),OpenForum.currentSearch.cursor.to() );
    OpenForum.scrollToLine( OpenForum.currentSearch.cursor.from().line );
    finds++;
  }
  OpenForum.search(OpenForum.currentSearch.replaceText);
  OpenForum.showSearchMatches();
  return finds;
};

OpenForum.clearSearch = function() {
  if(OpenForum.currentSearch === null) return;

  var marks = OpenForum.currentSearch.cm.getAllMarks();
  for(var i=0;i<marks.length; i++) {
    marks[i].clear();
  }
};

OpenForum.scrollToLine = function(lineNumber) {
  var top = document.getElementById(currentEditor.tabId).offsetTop;
  var height = document.getElementById(currentEditor.tabId).offsetHeight;
  var lines = currentEditor.editor.getCodeMirror().lastLine();

  document.scrollingElement.scrollTop=((height/lines)*lineNumber)-top;
};

$(document).bind('keydown', function(e) {
  if(e.ctrlKey && (e.which == 70)) {
    e.preventDefault();
    $("#OpenForumSearchModal").foundation('reveal','open');
    OpenForum.focusOnSearch();
    return false;
  }

  if(e.ctrlKey && (e.which == 71)) {
    e.preventDefault();
    if(e.shift) {
      OpenForum.showNextSearchMatch();
    } else {
      OpenForum.showNextSearchMatch();
    }
    return false;
  }

  if(e.ctrlKey && (e.which == 71)) {
    e.preventDefault();
    OpenForum.showNextSearchMatch();
    return false;
  }

  if(e.ctrlKey && e.shift && (e.which == 82)) {
    e.preventDefault();
    OpenForum.replaceAllMatches();
    return false;
  }
});
