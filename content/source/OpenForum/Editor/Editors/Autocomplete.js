/*
* Author: 
* Description: 
*/
  var Autocomplete = function(name) {
    var self = this;
    var override = function(codeMirror, option) { return {list: [], from: 0, to: 0}; };
    var completers = [];

    self.addCompleter = function(completer) {
      completers.push(completer);
    };

    var autotype = function(codeMirror, option) {
      var cursor = codeMirror.getCursor();
      var line = codeMirror.getLine(cursor.line);
      var start = cursor.ch;
      var end = cursor.ch;
      while (start && /\S/.test(line.charAt(start - 1))) --start;
      while (end < line.length && /\S/.test(line.charAt(end))) ++end;
      var word = line.slice(start, end).toLowerCase();
      var toCursor = line.substring(0, cursor.ch).toLowerCase();
      var list = [];
      var exclusive = false;

      for(var i in completers) {
        var result = completers[i]( {codeMirror: codeMirror, cursor: cursor, line: line, word: word, toCursor: toCursor} );
        for( var j in result.list) {
          list.push( result.list[j] );
        }
        if(result.exclusive) {
          exclusive = true;
          break;
        }
      }

      return {exclusive: exclusive, list: list};
    };

    var showList = function(codeMirror, option) {
      var hint = override(codeMirror, option);
      var extras = autotype(codeMirror, option);
      if(!extras.exclusive) {
        for(var i in hint.list) {
          extras.list.push(hint.list[i]);
        }
      }
      hint.list = extras.list;
      return hint;
    };

    if(CodeMirror.hint && CodeMirror.hint[name]) {
      override = CodeMirror.hint[name];
      CodeMirror.hint[name] = showList;
    }
  };