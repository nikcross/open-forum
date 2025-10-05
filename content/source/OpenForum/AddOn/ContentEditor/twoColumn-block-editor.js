/*
* Author: 
* Description: 
*/
var TwoColumnBlockEditor = function(data, parentId) {
  var self = this;
  var blocks = {};

  OpenForum.addScript( "/TheLab/Experiments/ContentEditor/text-block-editor.js" )
    .addScript( "/TheLab/Experiments/ContentEditor/WYSIWYG-block-editor.js" )
    .go();

  self.initView = function( elementId ) {
    OpenForum.getObject( elementId + "_text" ).setValue( data.title );
    OpenForum.addListener( elementId + "_text", function( obj ) { data.title=obj.getValue(); } );

    var view = "<div class='row' style='border: solid 2px white;' id='" + elementId + "_content'>";

    view += "<div class='columns large-6'>";


    view += renderAddButton( elementId, "addColumnA", false);
    
    for( var i in data.content.columnA ) {
      data.content.columnA[i].elementId = ("BK" + Math.random() + new Date().getTime()).replaceAll("\\.","_");
      view += "<span id='" + data.content.columnA[i].elementId + "'><span style='border: solid 1px; height: 150px;'>Loading...</span></span>";
      view += renderAddButton( data.content.columnA[i].elementId, "addAfter", true);
    }
    view += "</div>";

    view += "<div class='columns large-6'>";

    view += renderAddButton( elementId, "addColumnB", false);
    
    for( var i in data.content.columnB ) {
      data.content.columnB[i].elementId = ("BK" + Math.random() + new Date().getTime()).replaceAll("\\.","_");
      view += "<span id='" + data.content.columnB[i].elementId + "'><div style='border: solid 1px; height: 150px;'>Loading...</div></span>";
      view += renderAddButton( data.content.columnB[i].elementId, "addAfter", true);
    }
    view += "</div>";
    view += "</div>";

    view += "<div><a href='#' onClick='moveBlockUp(\""+ elementId + "\"); return false;' title='Move Up'><img src='/OpenForum/Images/icons/png/arrow_up.png' /></a>" +
      "<a href='#' onClick='moveBlockDown(\""+ elementId + "\"); return false;' title='Move Down'><img src='/OpenForum/Images/icons/png/arrow_down.png' /></a>" +
      "<a href='#' onClick='removeBlock(\""+ elementId + "\"); return false;' title='Remove two column block'><img src='/OpenForum/Images/icons/png/bin.png' /></a>" +
      "</div>";

    data.elementId = elementId;
    data.parentId = parentId;
    OpenForum.setElement( elementId, view );

    data.treeNode.setName( renderHighlightLink( elementId + "_content", data.treeNode.getName(), "Page" ) );
    
    initBlocks();
  };

  self.initTree = function(treeNode) {
    var node = treeNode.addChild( "Two Columns",{icon: "text_columns"} );
    data.treeNode = node;
    return node;
  };
  
  self.getElementId = function() {
    return data.elementId;
  };

  self.getParentId = function() {
    return data.parentId;
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

    return {i: parseInt( index ), row: row};
  };

  self.addBlock = function(instruction,type) {
    if(instruction.action=="addAfter") {
      var index = getContentIndex(instruction.id);

      var template = OpenForum.evaluate( type+"Editor.template" );
      var json = OpenForum.clone(template);

      data.content[index.row].splice( index.i+1,0,json );
    } else if(instruction.action=="addColumnA") {
      var template = OpenForum.evaluate( type+"Editor.template" );
      var json = OpenForum.clone(template);

      data.content.columnA.splice( 0,0,json );
    } else {
      var template = OpenForum.evaluate( type+"Editor.template" );
      var json = OpenForum.clone(template);

      data.content.columnB.splice( 0,0,json );
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
  };

  self.render = function() {
    var content = "<div class='row'>";
    content += "<div class='columns large-6'>";
    for( var i in data.content.columnA ) {
      content += data.content.columnA[i].blockEditor.render();
    }
    content += "</div>";
    content += "<div class='columns large-6'>";
    for( var i in data.content.columnB ) {
      content += data.content.columnB[i].blockEditor.render();
    }
    content += "</div>";
    content += "</div>";
    return content;
  };
};

TwoColumnBlockEditor.template = {
  "pageName": "",
  "title": "",
  "block": "twoColumn",
  content: {
    columnA: [],
    columnB: []
  }
};