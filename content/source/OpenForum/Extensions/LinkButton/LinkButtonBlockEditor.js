/*
* Built By: /OpenForum/AddOn/ServiceBuilder
* Description: v0.0.0
*/
var LinkButtonBlockEditor = function(data, parentId) {
  var self = this;
  self.setData( data );

  self.initView = function(elementId) { 

    
    OpenForum.getObject( elementId + "_href" ).setValue( data.data.href );
    OpenForum.addListener( elementId + "_href", function( obj ) { data.data.href=obj.getValue(); } );

    OpenForum.getObject( elementId + "_target" ).setValue( data.data.target );
    OpenForum.addListener( elementId + "_target", function( obj ) { data.data.target=obj.getValue(); } );


    var view = "<div class='row' id='" + elementId + "_view" + "' style='display: block;'>";


    view += "<div id='" + elementId + "_rendered" + "'>Loading...</div>";
    
    view += self.renderEditButton( elementId );
    view += self.renderBottomButtons( elementId );
    view += "</div>";

    view += "<div class='row' id='" + elementId + "_edit" + "'  style='display: none; border: solid 2px blue;'>";

	
  view += "href: <input type='text' of-id='" + elementId + "_href" + "' value='" +data.data.href + "'/>";

  view += "target: <input type='text' of-id='" + elementId + "_target" + "' value='" +data.data.target + "'/>";


    view += "<a class='button radius tiny' onClick='setViewMode(); return false;'>OK</a>";
    view += "</div>";

    data.elementId = elementId;
    data.parentId = parentId;
    self.createViewElement( elementId, view );
    self.setEditMode();

    data.treeNode.setName( self.renderHighlightLink( elementId + "_content", data.treeNode.getName(), "LinkButton" ) );

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
  var content = "[{/OpenForum/Extensions/LinkButton href='" + data.data['href'] + "' target='" + data.data['target'] + "' }]";

  return content;
};
};

LinkButtonBlockEditor.prototype = new BlockPrototype("","{{blockIcon}}");

LinkButtonBlockEditor.template = {
  "block": "linkButton",
  "data": {

     "href": "",

     "target": "",

    "id": ""
  }
};
