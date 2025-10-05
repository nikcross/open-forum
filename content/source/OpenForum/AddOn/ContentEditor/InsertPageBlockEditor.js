/*
* Author: 
* Description: 
*/
var InsertPageBlockEditor  = function(data, parentId) {
  var self = this;
  self.setData( data );
  
  self.initView = function(elementId) { 
    OpenForum.getObject( elementId + "_pageName" ).setValue( data.data.pageName );
    OpenForum.addListener( elementId + "_pageName", function( obj ) { data.data.pageName=obj.getValue(); } );
    
    OpenForum.getObject( elementId + "_section" ).setValue( data.data.section );
    OpenForum.addListener( elementId + "_section", function( obj ) { data.data.section=obj.getValue(); } );
    
    var view = "<div class='row' id='" + elementId + "_view" + "' style='display: block;'>"+
        
        "<div style='border: solid 2px black; width: 100%; height: 100px;'>Insert Page " + data.data.pageName + " Section: " + data.data.section + "</div>";
    
    view += self.renderEditButton( elementId );
    view += self.renderBottomButtons( elementId );
    view += "</div>";
      
     view += "<div class='row' id='" + elementId + "_edit" + "'  style='display: none;'>"+
       
       "Page Name: <input type='text' of-id='" + elementId + "_pageName" + "' value='" +data.data.pageName + "' onfocusout='setViewMode();'/>"+
       "Section: <input type='text' of-id='" + elementId + "_section" + "' value='" + data.data.section + "' onfocusout='setViewMode();'/>"+
       
       "</div>";
    
    data.elementId = elementId;
    data.parentId = parentId;
    self.createViewElement( elementId, view );

    
    data.treeNode.setName( self.renderHighlightLink( elementId + "_content", data.treeNode.getName(), "Page" ) );
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
    if( data.data.section=="" ) {
    return "[{InsertPage page='" + data.data.pageName + "'}]";
    } else {
    return "[{InsertPage page='" + data.data.pageName + "' section='" + data.data.section + "'}]";
    }
  };
};


InsertPageBlockEditor.prototype = new BlockPrototype("Page Insert","page_white");

InsertPageBlockEditor.template = {
  "block": "insertPage",
  "data": {
    "pageName": "",
    "section": ""
  }
};