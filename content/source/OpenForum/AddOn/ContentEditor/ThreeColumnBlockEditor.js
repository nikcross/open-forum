/*
* Author: 
* Description: 
*/
var ThreeColumnBlockEditor = function(data, parentId) {
  var self = this;
  self.setData( data );
  
  var blocks = {};

  OpenForum.addScript( "/TheLab/Experiments/ContentEditor/text-block-editor.js" )
    .addScript( "/TheLab/Experiments/ContentEditor/WYSIWYG-block-editor.js" )
    .go();

  self.initView = function( elementId ) {

    var view = "<div class='columns large-4'>";
    view += self.renderAddButton( elementId, "addColumnA", false);
    for( var i in data.content.columnA ) {
      data.content.columnA[i].elementId = ("BK" + Math.random() + new Date().getTime()).replaceAll("\\.","_");
      view += "<span id='" + data.content.columnA[i].elementId + "'><span style='border: solid 1px; height: 150px;'>Loading...</span></span>";
      view += self.renderAddButton( data.content.columnA[i].elementId, "addAfter", true);
    }
    view += "</div>";

    view += "<div class='columns large-4'>";
    view += self.renderAddButton( elementId, "addColumnB", false);
    for( var i in data.content.columnB ) {
      data.content.columnB[i].elementId = ("BK" + Math.random() + new Date().getTime()).replaceAll("\\.","_");
      view += "<span id='" + data.content.columnB[i].elementId + "'><div style='border: solid 1px; height: 150px;'>Loading...</div></span>";
      view += self.renderAddButton( data.content.columnB[i].elementId, "addAfter", true);
    }
    view += "</div>";
    
    view += "<div class='columns large-4'>";
    view += self.renderAddButton( elementId, "addColumnC", false);
    for( var i in data.content.columnC ) {
      data.content.columnC[i].elementId = ("BK" + Math.random() + new Date().getTime()).replaceAll("\\.","_");
      view += "<span id='" + data.content.columnC[i].elementId + "'><div style='border: solid 1px; height: 150px;'>Loading...</div></span>";
      view += self.renderAddButton( data.content.columnC[i].elementId, "addAfter", true);
    }
    view += "</div>";

    view += self.renderBottomButtons( elementId );

    data.elementId = elementId;
    data.parentId = parentId;
    self.createViewElement( elementId, view );

    data.treeNode.setName( self.renderHighlightLink( elementId + "_content", data.treeNode.getName(), "Page" ) );
    
    initBlocks();
  };

  var getContentIndex = function(id) {
    var index = -1;
    var row = "columnA";
    for(var i in data.content.columnA) {
      if(data.content.columnA[i].elementId == id) {
        index = i;
        break;
      }
    }
    if(index==-1) {
      row = "columnB";
      for(var i in data.content.columnB) {
        if(data.content.columnB[i].elementId == id) {
          index = i;
          break;
        }
      }
    }
    if(index==-1) {
      row = "columnC";
      for(var i in data.content.columnC) {
        if(data.content.columnC[i].elementId == id) {
          index = i;
          break;
        }
      }
    }

    return {i: parseInt( index ), row: row};
  };

  self.addBlock = function(instruction,type) {
    if(instruction.action=="addAfter") {
      var index = getContentIndex(instruction.id);

      var template = OpenForum.evaluate( type+"BlockEditor.template" );
      var json = OpenForum.clone(template);

      data.content[index.row].splice( index.i+1,0,json );
    } else if(instruction.action=="addColumnA") {
      var template = OpenForum.evaluate( type+"BlockEditor.template" );
      var json = OpenForum.clone(template);

      data.content.columnA.splice( 0,0,json );
    } else  if(instruction.action=="addColumnB") {
      var template = OpenForum.evaluate( type+"BlockEditor.template" );
      var json = OpenForum.clone(template);

      data.content.columnB.splice( 0,0,json );
    } else  if(instruction.action=="addColumnC") {
      var template = OpenForum.evaluate( type+"BlockEditor.template" );
      var json = OpenForum.clone(template);

      data.content.columnC.splice( 0,0,json );
    }
    initialisePageEditor( pageData );
  };

  self.moveBlockUp = function(id) {
    var index = getContentIndex(id);
    OpenForum.Table.moveRowUp( data.content[index.row], index.i );
    initialisePageEditor( pageData );
  };

  self.moveBlockDown = function(id) {
    var index = getContentIndex(id);
    OpenForum.Table.moveRowDown( data.content[index.row], index.i );
    initialisePageEditor( pageData );
  };

  self.removeBlock = function(id) {
    var index = getContentIndex(id);
    OpenForum.Table.removeRow( data.content[index.row], index.i );
    initialisePageEditor( pageData );
  };

  self.setEditMode = function() {
    //OpenForum.showElement( data.elementId + "_edit" );
    //OpenForum.hideElement( data.elementId + "_view" );
  };

  self.setViewMode = function() {
    //OpenForum.hideElement( data.elementId + "_edit" );
    //OpenForum.showElement( data.elementId + "_view" );
  };

  var initBlocks = function() {
    for( var i in data.content.columnA ) {
      (function(index) {
        OpenForum.waitFor(
          function() {
            return document.getElementById(data.content.columnA[index].elementId) != null;
          },
          function() {
            createBlockEditor( data.content.columnA[index].block, data.content.columnA[index], data.elementId, data.content.columnA[index].elementId, data.treeNode );
          },
          500
        );
      } )(i);
    }
    for( var i in data.content.columnB ) {
      (function(index) {
        OpenForum.waitFor(
          function() {
            return document.getElementById(data.content.columnB[index].elementId) != null;
          },
          function() {
            createBlockEditor( data.content.columnB[index].block, data.content.columnB[index], data.elementId, data.content.columnB[index].elementId, data.treeNode );
          },
          500
        );
      } )(i);
    }
    for( var i in data.content.columnC ) {
      (function(index) {
        OpenForum.waitFor(
          function() {
            return document.getElementById(data.content.columnC[index].elementId) != null;
          },
          function() {
            createBlockEditor( data.content.columnC[index].block, data.content.columnC[index], data.elementId, data.content.columnC[index].elementId, data.treeNode );
          },
          500
        );
      } )(i);
    }
  };

  self.render = function() {
    var content = "<div class='row'>";
    content += "<div class='columns large-4'>";
    for( var i in data.content.columnA ) {
      content += data.content.columnA[i].blockEditor.render();
    }
    content += "</div>";
    content += "<div class='columns large-4'>";
    for( var i in data.content.columnB ) {
      content += data.content.columnB[i].blockEditor.render();
    }
    content += "</div>";
    content += "<div class='columns large-4'>";
    for( var i in data.content.columnC ) {
      content += data.content.columnC[i].blockEditor.render();
    }
    content += "</div>";
    content += "</div>";
    return content;
  };
};

ThreeColumnBlockEditor.prototype = new BlockPrototype("Three Column", "text_columns");

ThreeColumnBlockEditor.template = {
  "pageName": "",
  "block": "threeColumn",
  content: {
    columnA: [],
    columnB: [],
    columnC: []
  }
};