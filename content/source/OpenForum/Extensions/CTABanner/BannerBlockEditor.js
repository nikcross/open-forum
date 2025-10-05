/*
* Built By: /OpenForum/AddOn/ServiceBuilder
* Description: v0.0.2
*/
var BannerBlockEditor = function(data, parentId) {
  var self = this;
  self.setData( data );

  self.initView = function(elementId) { 

    
    OpenForum.getObject( elementId + "_imageURL" ).setValue( data.data.imageURL );
    OpenForum.addListener( elementId + "_imageURL", function( obj ) { data.data.imageURL=obj.getValue(); } );

    OpenForum.getObject( elementId + "_title" ).setValue( data.data.title );
    OpenForum.addListener( elementId + "_title", function( obj ) { data.data.title=obj.getValue(); } );

    OpenForum.getObject( elementId + "_text" ).setValue( data.data.text );
    OpenForum.addListener( elementId + "_text", function( obj ) { data.data.text=obj.getValue(); } );


    var view = "<div class='row' id='" + elementId + "_view" + "' style='display: block;'>";


    view += "<div id='" + elementId + "_rendered" + "'>Loading...</div>";
    
    view += self.renderEditButton( elementId );
    view += self.renderBottomButtons( elementId );
    view += "</div>";

    view += "<div class='row' id='" + elementId + "_edit" + "'  style='display: none; border: solid 2px blue;'>";

	
  view += "imageURL: <input type='text' of-id='" + elementId + "_imageURL" + "' value='" +data.data.imageURL + "'/>";

  view += "title: <input type='text' of-id='" + elementId + "_title" + "' value='" +data.data.title + "'/>";

  view += "text: <input type='text' of-id='" + elementId + "_text" + "' value='" +data.data.text + "'/>";


    view += "<a class='button radius tiny' onClick='setViewMode(); return false;'>OK</a>";
    view += "</div>";

    data.elementId = elementId;
    data.parentId = parentId;
    self.createViewElement( elementId, view );
    self.setEditMode();

    data.treeNode.setName( self.renderHighlightLink( elementId + "_content", data.treeNode.getName(), "Banner" ) );

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
  var content = "[{/OpenForum/Extensions/Banner imageURL='" + data.data['imageURL'] + "' title='" + data.data['title'] + "' text='" + data.data['text'] + "' }]";

  return content;
};
};

BannerBlockEditor.prototype = new BlockPrototype("Banner","{{blockIcon}}");

BannerBlockEditor.template = {
  "block": "banner",
  "data": {

     "imageURL": "",

     "title": "",

     "text": "",

    "id": ""
  }
};
