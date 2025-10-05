/*
* Built By: /OpenForum/AddOn/ServiceBuilder
* Description: v0.0.1
*/
var ContrastBlockBlockEditor = function(data, parentId) {
  var self = this;
  self.setData( data );

  self.initView = function(elementId) { 

    
    OpenForum.getObject( elementId + "_text" ).setValue( data.data.text );
    OpenForum.addListener( elementId + "_text", function( obj ) { data.data.text=obj.getValue(); } );

    OpenForum.getObject( elementId + "_backgroundColor" ).setValue( data.data.backgroundColor );
    OpenForum.addListener( elementId + "_backgroundColor", function( obj ) { data.data.backgroundColor=obj.getValue(); } );

    OpenForum.getObject( elementId + "_textColor" ).setValue( data.data.textColor );
    OpenForum.addListener( elementId + "_textColor", function( obj ) { data.data.textColor=obj.getValue(); } );

    OpenForum.getObject( elementId + "_imageURL" ).setValue( data.data.imageURL );
    OpenForum.addListener( elementId + "_imageURL", function( obj ) { data.data.imageURL=obj.getValue(); } );

    OpenForum.getObject( elementId + "_imageRight" ).setValue( data.data.imageRight );
    OpenForum.addListener( elementId + "_imageRight", function( obj ) { data.data.imageRight=obj.getValue(); } );


    var view = "<div class='row' id='" + elementId + "_view" + "' style='display: block;'>";


    view += "<div id='" + elementId + "_rendered" + "'>Loading...</div>";
    
    view += self.renderEditButton( elementId );
    view += self.renderBottomButtons( elementId );
    view += "</div>";

    view += "<div class='row' id='" + elementId + "_edit" + "'  style='display: none; border: solid 2px blue;'>";

	
  view += "text: <input type='text' of-id='" + elementId + "_text" + "' value='" +data.data.text + "'/>";

  view += "backgroundColor: <input type='text' of-id='" + elementId + "_backgroundColor" + "' value='" +data.data.backgroundColor + "'/>";

  view += "textColor: <input type='text' of-id='" + elementId + "_textColor" + "' value='" +data.data.textColor + "'/>";

  view += "imageURL: <input type='text' of-id='" + elementId + "_imageURL" + "' value='" +data.data.imageURL + "'/>";

  view += "imageRight: <input type='text' of-id='" + elementId + "_imageRight" + "' value='" +data.data.imageRight + "'/>";


    view += "<a class='button radius tiny' onClick='setViewMode(); return false;'>OK</a>";
    view += "</div>";

    data.elementId = elementId;
    data.parentId = parentId;
    self.createViewElement( elementId, view );
    self.setEditMode();

    data.treeNode.setName( self.renderHighlightLink( elementId + "_content", data.treeNode.getName(), "ContrastBlock" ) );

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
  var content = "[{/OpenForum/Extensions/ContrastBlock text='" + data.data['text'] + "' backgroundColor='" + data.data['backgroundColor'] + "' textColor='" + data.data['textColor'] + "' imageURL='" + data.data['imageURL'] + "' imageRight='" + data.data['imageRight'] + "' }]";

  return content;
};
};

ContrastBlockBlockEditor.prototype = new BlockPrototype("Contrast Block","{{blockIcon}}");

ContrastBlockBlockEditor.template = {
  "block": "contrastBlock",
  "data": {

     "text": "",

     "backgroundColor": "",

     "textColor": "",

     "imageURL": "",

     "imageRight": "",

    "id": ""
  }
};
