/*
* Author: 
* Description: 
*/
var TextBlockEditor = function(data, parentId) {
  var self = this;

  self.initView = function(elementId) {
    OpenForum.getObject( elementId + "_text" ).setValue( data.data.text );
    OpenForum.addListener( elementId + "_text", function( obj ) { data.data.text=obj.getValue(); } );

    var view = "<div id='" + elementId + "_content' style='border: solid 2px white;'> <div class='row' id='" + elementId + "_view" + "' style='display: block;'>{{" + elementId + "_text" + "}}"+
        "<a href='#' onClick='editBlock(\""+ elementId + "\"); return false;' title='Edit'><img src='/OpenForum/Images/icons/png/pencil.png' /></a>" +
        "<a href='#' onClick='moveBlockUp(\""+ elementId + "\"); return false;' title='Move Up'><img src='/OpenForum/Images/icons/png/arrow_up.png' /></a>" +
        "<a href='#' onClick='moveBlockDown(\""+ elementId + "\"); return false;' title='Move Down'><img src='/OpenForum/Images/icons/png/arrow_down.png' /></a>" +
        "<a href='#' onClick='removeBlock(\""+ elementId + "\"); return false;' title='Remove'><img src='/OpenForum/Images/icons/png/bin.png' /></a>" +
        "</div>" +
        "<div class='row' id='" + elementId + "_edit" + "'  style='display: none;' onmouseout='setViewMode();'><textarea of-id='" + elementId + "_text" + "'>" + data.data.text + "</textarea></div></div>";

    data.elementId = elementId;
    data.parentId = parentId;
    OpenForum.setElement( elementId, view );
    
    data.treeNode.setName( renderHighlightLink( elementId+"_content", data.treeNode.getName(), "Text Block" ) );

  };
  
  self.initTree = function(treeNode) {
    var node = treeNode.addChild( "Simple Text Block",{icon: "page_white_edit"} );
    data.treeNode = node;
    return node;
  };

  self.getElementId = function() {
    return data.elementId;
  };

  self.getParentId = function() {
    return data.parentId;
  };

  self.setEditMode = function() {
    OpenForum.showElement( data.elementId + "_edit" );
    OpenForum.hideElement( data.elementId + "_view" );
  };

  self.setViewMode = function() {
    OpenForum.hideElement( data.elementId + "_edit" );
    OpenForum.showElement( data.elementId + "_view" );
  };

  self.render = function() {
    return "<p>" + data.data.text + "</p><br/>";
  };
};

TextBlockEditor.template = {
  "block": "text",
  "data": {
    "text": ""
  },
  "elementId": "",
  "editor": {},
  "blockEditor": {}
};
