/*
* Built By: /OpenForum/AddOn/ServiceBuilder
* Description: v0.0.7
*/
var InsertPageBlockEditor = function(data, parentId) {
  var self = this;
  self.setData( data );

  self.initView = function(elementId) { 

    
    OpenForum.getObject( elementId + "_page" ).setValue( data.data.page );
    OpenForum.addListener( elementId + "_page", function( obj ) { data.data.page=obj.getValue(); } );

    OpenForum.getObject( elementId + "_section" ).setValue( data.data.section );
    OpenForum.addListener( elementId + "_section", function( obj ) { data.data.section=obj.getValue(); } );


    var view = "<div class='row' id='" + elementId + "_view" + "' style='display: block;'>";


    view += "<div id='" + elementId + "_rendered" + "'>Loading...</div>";
    
    view += self.renderEditButton( elementId );
    view += self.renderBottomButtons( elementId );
    view += "</div>";

    view += "<div class='row' id='" + elementId + "_edit" + "'  style='display: none; border: solid 2px blue;'>";

	
  view += "page: <input type='text' of-id='" + elementId + "_page" + "' value='" +data.data.page + "'/>";

  view += "section: <input type='text' of-id='" + elementId + "_section" + "' value='" +data.data.section + "'/>";


    view += "<a class='button radius tiny' onClick='setViewMode(); return false;'>OK</a>";
    view += "</div>";

    data.elementId = elementId;
    data.parentId = parentId;
    self.createViewElement( elementId, view );
    self.setEditMode();

    data.treeNode.setName( self.renderHighlightLink( elementId + "_content", data.treeNode.getName(), "InsertPage" ) );

  return view;
};

self.setEditMode = function() {
  OpenForum.showElement( data.elementId + "_edit" );
  OpenForum.hideElement( data.elementId + "_view" );
};

self.setViewMode = function() {
  OpenForum.hideElement( data.elementId + "_edit" );
  OpenForum.showElement( data.elementId + "_view" );
     
  OFX.post("/OpenForum/Actions/RenderWikiData").withAction("render").withData({json: true, data: self.render(), pageName: "/Test"})
    .onSuccess( function(response) {
      OpenForum.setElement( data.elementId + "_rendered", response );
  }).go();
};

self.render = function() {
  var content = "[{/OpenForum/Extensions/InsertPage page='" + data.data['page'] + "' section='" + data.data['section'] + "' }]";

  return content;
};
};

InsertPageBlockEditor.prototype = new BlockPrototype("Insert Page","{{blockIcon}}");

InsertPageBlockEditor.template = {
  "block": "insertPage",
  "data": {

     "page": "",

     "section": "",

    "id": ""
  }
};
