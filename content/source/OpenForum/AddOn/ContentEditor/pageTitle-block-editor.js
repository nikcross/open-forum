/*
* Author: 
* Description: 
*/
var PageTitleBlockEditor = function(data, parentId) {
  var self = this;
  
  self.initView = function(elementId) {
    var view = "<div class='row' id='" + elementId + "_content" + "' style='border: solid 2px white;' ><h3>{{pageData.title}}</h3>"+
        "<a href='#' onClick='moveBlockUp(\""+ elementId + "\"); return false;' title='Move Up'><img src='/OpenForum/Images/icons/png/arrow_up.png' /></a>" +
        "<a href='#' onClick='moveBlockDown(\""+ elementId + "\"); return false;' title='Move Down'><img src='/OpenForum/Images/icons/png/arrow_down.png' /></a>" +
        "<a href='#' onClick='removeBlock(\""+ elementId + "\"); return false;' title='Remove'><img src='/OpenForum/Images/icons/png/bin.png' /></a>" +
        "</div>";
    data.elementId = elementId;
    data.parentId = parentId;
    OpenForum.setElement( elementId, view );
    
    data.treeNode.setName( renderHighlightLink( elementId + "_content", data.treeNode.getName(), "Page" ) );
  };
  
  self.initTree = function(treeNode) {
    var node = treeNode.addChild( "Page Title",{icon: "textfield"} );
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
  };

  self.setViewMode = function() {
  };

  self.render = function() {
    return "!!&title;";
  };
};

PageTitleBlockEditor.template = {
    "block": "pageTitle",
    "elementId": "",
    "editor": {},
    "blockEditor": {}
};
