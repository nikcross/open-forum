/*
* Author: 
* Description: 
*/
var SectionBlockEditor = function(data, parentId) {
  var self = this;
  self.setData( data );

  self.initView = function(elementId) { 
    OpenForum.getObject( elementId + "_title" ).setValue( data.data.title );
    OpenForum.addListener( elementId + "_title", function( obj ) { data.data.title=obj.getValue(); } );

    OpenForum.getObject( elementId + "_id" ).setValue( data.data.id );
    OpenForum.addListener( elementId + "_id", function( obj ) { data.data.id=obj.getValue(); } );

    var view = "<div class='row' id='" + elementId + "_view" + "' style='display: block;'>"+

        "<hr /><h2>{{" + elementId + "_title" + "}}</h2>";

    view += self.renderEditButton( elementId );
    view += self.renderBottomButtons( elementId );
    view += "</div>";

    view += "<div class='row' id='" + elementId + "_edit" + "'  style='display: none;'>"+

      "Title: <input type='text' of-id='" + elementId + "_title" + "' value='" +data.data.title + "' onfocusout='setViewMode();'/>"+
      "Id: <input type='text' of-id='" + elementId + "_id" + "' value='" + data.data.id + "' onfocusout='setViewMode();'/>"+

      "</div>";

    view += "<div class='row'><div class='columns large-12'>";
    view += self.renderAddButton( elementId, "addColumn", false);
    for( var i in data.content.column ) {
      data.content.column[i].elementId = ("BK" + Math.random() + new Date().getTime()).replaceAll("\\.","_");
      view += "<span id='" + data.content.column[i].elementId + "'><span style='border: solid 1px; height: 150px;'>Loading...</span></span>";
      view += self.renderAddButton( data.content.column[i].elementId, "addAfter", true);
    }
    view += "</div></div>";

    data.elementId = elementId;
    data.parentId = parentId;
    self.createViewElement( elementId, view );


    data.treeNode.setName( self.renderHighlightLink( elementId + "_content", data.treeNode.getName(), "Page" ) );
    
    initBlocks();
  };

  var getContentIndex = function(id) {
    var index = -1;
    var row = "column";
    for(var i in data.content.column) {
      if(data.content.column[i].elementId == id) {
        index = i;
        break;
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
    } else if(instruction.action=="addColumn") {
      var template = OpenForum.evaluate( type+"BlockEditor.template" );
      var json = OpenForum.clone(template);

      data.content.column.splice( 0,0,json );
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
    OpenForum.showElement( data.elementId + "_edit" );
    OpenForum.hideElement( data.elementId + "_view" );
  };

  self.setViewMode = function() {
    OpenForum.hideElement( data.elementId + "_edit" );
    OpenForum.showElement( data.elementId + "_view" );
  };

  var initBlocks = function() {
    for( var i in data.content.column ) {
      (function(index) {
        OpenForum.waitFor(
          function() {
            return document.getElementById(data.content.column[index].elementId) != null;
          },
          function() {
            createBlockEditor( data.content.column[index].block, data.content.column[index], data.elementId, data.content.column[index].elementId, data.treeNode );
          },
          500
        );
      } )(i);
    }
  };
  
  self.render = function() {
    var content = "\n--8<--\n<hr />"+
        "<a id='" + data.data.id + "_id" + "'></a>"+
        "<h2>" + data.data.title + "</h2>\n";

    content += "<div class='row'>";
    content += "<div class='columns large-12'>";
    for( var i in data.content.column ) {
      content += data.content.column[i].blockEditor.render();
    }
    content += "</div>";
    content += "</div>";

    content += "\n-->8--\n";

    return content;
  };
};

SectionBlockEditor.prototype = new BlockPrototype("Section Heading","textfield");

SectionBlockEditor.template = {
  "block": "section",
  "content": {
    "column": []
  },
  "data": {
    "title": "",
    "id": ""
  }
};