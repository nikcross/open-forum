/*
* Author: 
* Description: 
*/
var BlockPrototype = function(name, icon) {

  var self = this;
  var data = {};

  self.setData = function( newData ) {
    data = newData;
  };

  self.initView = function(elementId) {
  };

  self.initTree = function(treeNode) {
    var node = treeNode.addChild( name,{icon: icon} );
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
  };

  // Helper Functions

  self.createViewElement = function( elementId, view ) {
    view = "<div class='row' id='" + elementId + "_content' style='border: solid 2px white;'>" + view + "</div>";
    OpenForum.setElement( elementId, view );
  };
  
  self.renderUpButton = function( elementId ) {
    return "<a href='#' onClick='moveBlockUp(\""+ elementId + "\"); return false;' title='Move Up'><img src='/OpenForum/Images/icons/png/arrow_up.png' /></a>";
  };

  self.renderDownButton = function( elementId ) {
    return "<a href='#' onClick='moveBlockDown(\""+ elementId + "\"); return false;' title='Move Down'><img src='/OpenForum/Images/icons/png/arrow_down.png' /></a>";
  };

  self.renderEditButton = function( elementId ) {
    return "<a href='#' onClick='editBlock(\""+ elementId + "\"); return false;' title='Edit'><img src='/OpenForum/Images/icons/png/pencil.png' /></a>";
  };
  
  self.renderDeleteButton = function( elementId ) {
    return "<a href='#' onClick='removeBlock(\""+ elementId + "\"); return false;' title='Remove'><img src='/OpenForum/Images/icons/png/bin.png' /></a>";
  };

  self.renderBottomButtons = function( elementId ) {
    return self.renderUpButton( elementId ) +  self.renderDownButton( elementId ) + self.renderDeleteButton( elementId );
  };

  self.renderAddButton = function( elementId, action, callParent ) {
    return "<a href='#' onClick='addBlock( {id: \"" + elementId + "\", action:\"" + action + "\", callParent: " + callParent + "}); return false;'"+
      "style='width: 100%; height: 20px; padding: 0px; margin: 0px; background-color: white;' "+
      "title='Add a new block to the " + name + "' class='button' "+
      "onmouseover='this.style.backgroundColor=\"#2ba6cb\";'"+
      "onmouseout='this.style.backgroundColor=\"white\";'>"+
      "<img src='/OpenForum/Images/icons/png/add.png' />"+
      "</a>";
  };

  self.renderHighlightLink = function( elementId, name, description ) {
    return "<a href='#" + elementId + "' title='" + description + "' onmouseover='highlight( \"" + elementId + "\", true );' onmouseout='highlight( \"" + elementId + "\", false );'><b>" + name + "</b></a>";
  };

};
