/*
* Author: 
* Description: 
*/
var PageTitleBlockEditor = function(data, parentId) {
  var self = this;
  self.setData( data );
  
  self.initView = function(elementId) {
    var view = "<h1>{{pageData.title}}</h1>";
    view += self.renderBottomButtons( elementId );
    
    data.elementId = elementId;
    data.parentId = parentId;
    self.createViewElement( elementId, view );

    data.treeNode.setName( self.renderHighlightLink( elementId + "_content", data.treeNode.getName(), "Page" ) );
  };

  self.render = function() {
    return "<h1>" + pageData.title + "<h1>";
  };
};

PageTitleBlockEditor.prototype = new BlockPrototype( "Page Title", "textfield" );

PageTitleBlockEditor.template = {
    "block": "pageTitle",
    "elementId": "",
    "editor": {},
    "blockEditor": {}
};
