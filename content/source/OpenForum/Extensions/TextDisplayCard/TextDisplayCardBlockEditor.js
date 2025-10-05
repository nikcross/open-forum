/*
* Built By: /OpenForum/AddOn/ServiceBuilder
* Description: v0.0.1
*/
var TextDisplayCardBlockEditor = function(data, parentId) {
  var self = this;
  self.setData( data );

  self.initView = function(elementId) { 

    
    OpenForum.getObject( elementId + "_title" ).setValue( data.data.title );
    OpenForum.addListener( elementId + "_title", function( obj ) { data.data.title=obj.getValue(); } );

    OpenForum.getObject( elementId + "_description" ).setValue( data.data.description );
    OpenForum.addListener( elementId + "_description", function( obj ) { data.data.description=obj.getValue(); } );

    OpenForum.getObject( elementId + "_linkText" ).setValue( data.data.linkText );
    OpenForum.addListener( elementId + "_linkText", function( obj ) { data.data.linkText=obj.getValue(); } );

    OpenForum.getObject( elementId + "_linkURL" ).setValue( data.data.linkURL );
    OpenForum.addListener( elementId + "_linkURL", function( obj ) { data.data.linkURL=obj.getValue(); } );


    var view = "<div class='row' id='" + elementId + "_view" + "' style='display: block;'>";


    view += "<div id='" + elementId + "_rendered" + "'>Loading...</div>";
    
    view += self.renderEditButton( elementId );
    view += self.renderBottomButtons( elementId );
    view += "</div>";

    view += "<div class='row' id='" + elementId + "_edit" + "'  style='display: none; border: solid 2px blue;'>";

	
  view += "title: <input type='text' of-id='" + elementId + "_title" + "' value='" +data.data.title + "'/>";

  view += "description: <input type='text' of-id='" + elementId + "_description" + "' value='" +data.data.description + "'/>";

  view += "linkText: <input type='text' of-id='" + elementId + "_linkText" + "' value='" +data.data.linkText + "'/>";

  view += "linkURL: <input type='text' of-id='" + elementId + "_linkURL" + "' value='" +data.data.linkURL + "'/>";


    view += "<a class='button radius tiny' onClick='setViewMode(); return false;'>OK</a>";
    view += "</div>";

    data.elementId = elementId;
    data.parentId = parentId;
    self.createViewElement( elementId, view );
    self.setEditMode();

    data.treeNode.setName( self.renderHighlightLink( elementId + "_content", data.treeNode.getName(), "TextDisplayCard" ) );

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
  var content = "[{/OpenForum/Extensions/TextDisplayCard title='" + data.data['title'] + "' description='" + data.data['description'] + "' linkText='" + data.data['linkText'] + "' linkURL='" + data.data['linkURL'] + "' }]";

  return content;
};
};

TextDisplayCardBlockEditor.prototype = new BlockPrototype("Text Display Card","{{blockIcon}}");

TextDisplayCardBlockEditor.template = {
  "block": "textDisplayCard",
  "data": {

     "title": "",

     "description": "",

     "linkText": "",

     "linkURL": "",

    "id": ""
  }
};
