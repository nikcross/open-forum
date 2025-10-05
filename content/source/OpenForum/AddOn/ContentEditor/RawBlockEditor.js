/*
* Author: 
* Description: 
*/
var RawBlockEditor = function(data, parentId) {
  var self = this;
  self.setData( data );

  self.initView = function(elementId) {
    OpenForum.getObject( elementId + "_text" ).setValue( data.data.text );
    OpenForum.addListener( elementId + "_text", function( obj ) { data.data.text=obj.getValue(); } );

    var view = "<div class='row' id='" + elementId + "_view" + "' style='display: block;'>"+
        
        "{{" + elementId + "_text" + "}}";
    
    view += self.renderEditButton( elementId );
    view += self.renderBottomButtons( elementId );
    view += "</div>";
      
    var textRows = data.data.text.split("\n").length+2;
    
     view += "<div class='row' id='" + elementId + "_edit" + "'  style='display: none;'>"+
       
       "<textarea of-id='" + elementId + "_text" + "' onblur='setViewMode();' rows='" + textRows + "'>" + data.data.text + "</textarea>"+
       
       "</div>";

    data.elementId = elementId;
    data.parentId = parentId;
    
    self.createViewElement( elementId, view );

    data.treeNode.setName( self.renderHighlightLink( elementId+"_content", data.treeNode.getName(), "Text Block" ) );

  };

  self.initTree = function(treeNode) {
    var node = treeNode.addChild( "Raw Html Block",{icon: "page_white_edit"} );
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
    return data.data.text;
  };
};

RawBlockEditor.prototype = new BlockPrototype("text");

RawBlockEditor.template = {
  "block": "raw",
  "data": {
    "text": ""
  },
  "elementId": "",
  "editor": {},
  "blockEditor": {}
};
