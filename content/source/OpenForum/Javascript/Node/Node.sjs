/*
* Author: 
* Description: 
*/

var Node = function() {
  var self = this;
  var suffix = ".json";
  
  self.setSuffix = function(newSuffix) {
    suffix = newSuffix;
  };
  
  var findPath = function(path,word) {
    var prefix = "";
    var pageName = null;
    var fileName = null;

    for(var i=0;i<word.length;i++) {

      prefix += word.charAt(i);
      path += "/" + prefix;

      if(file.attachmentExists(path,prefix+suffix)===true) {
        fileName = prefix + suffix;
        pageName = path;
      }

    }

    if (pageName !== null && fileName !== null) {
      return {pageName: pageName, fileName: fileName, word: word};
    }
  };

  var loadRecords = function(nodePath) {
    var data = ""+file.getAttachment(nodePath.pageName,nodePath.fileName);
    return JSON.parse(data);
  };

  var saveRecords = function(node) {
    file.saveAttachment(node.nodePath.pageName,node.nodePath.fileName,JSON.stringify(node.records,null,4));
  };

  self.setConnection = function(path,word,type,value) {
    var node = self.find(path,word);
    if(!node) {
      return "Not Found "+path+" "+word;
    }

    for(var i=0;i<node.record.connections.length;i++) {
      connection = node.record.connections[i];
      if(connection.type==type && connection.value==value) {
        return "Exists"; //Connection already exists
      }
    }

    node.record.connections.push({type: type, value:value});

    saveRecords( node );

    return true;
  };

  self.removeConnection = function(path,word,type,value) {
    var node = self.find(path,word);
    if(!node) {
      return false;
    }

    var found = false;
    var newConnections = [];
    for(var i=0;i<node.record.connections.length;i++) {
      connection = node.record.connections[i];
      if(connection.type==type && connection.value==value) {
        found = true;
        continue; //Skip this one
      }
      newConnections.push( connection );
    }

    node.record.connections = newConnections;

    if( found ) {
      saveRecords( node );
      return true;
    } else {
      return false;
    }
  };

  self.find = function(path,word) {
    var nodePath = findPath(path,word);
    if(!nodePath) {
      return;
    }

    var json = loadRecords( nodePath );
    var record = json[word];

    if(!record) {
      /*if(word.substring(word.length-1)=="s") {
        record = json[word.substring(0,word.length-1)];
      }*/
      record = "?";
    }

    return {record: record,records: json,nodePath: nodePath};
  };
};
