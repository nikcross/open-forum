/*
* Built By: /OpenForum/AddOn/ServiceBuilder
* Description: v0.0.1
*/
var AttachmentsListBlockEditor = function(data, parentId) {
  var self = this;
  self.setData( data );

  self.initView = function(elementId) { 

    
    OpenForum.getObject( elementId + "_targetPage" ).setValue( data.data.targetPage );
    OpenForum.addListener( elementId + "_targetPage", function( obj ) { data.data.targetPage=obj.getValue(); } );

    OpenForum.getObject( elementId + "_matching" ).setValue( data.data.matching );
    OpenForum.addListener( elementId + "_matching", function( obj ) { data.data.matching=obj.getValue(); } );

    OpenForum.getObject( elementId + "_actions" ).setValue( data.data.actions );
    OpenForum.addListener( elementId + "_actions", function( obj ) { data.data.actions=obj.getValue(); } );


    var view = "<div class='row' id='" + elementId + "_view" + "' style='display: block;'>";


    view += "<div id='" + elementId + "_rendered" + "'>Loading...</div>";
    
    view += self.renderEditButton( elementId );
    view += self.renderBottomButtons( elementId );
    view += "</div>";

    view += "<div class='row' id='" + elementId + "_edit" + "'  style='display: none; border: solid 2px blue;'>";

	
  view += "targetPage: <input type='text' of-id='" + elementId + "_targetPage" + "' value='" +data.data.targetPage + "'/>";

  view += "matching: <input type='text' of-id='" + elementId + "_matching" + "' value='" +data.data.matching + "'/>";

  view += "actions: <input type='text' of-id='" + elementId + "_actions" + "' value='" +data.data.actions + "'/>";


    view += "<a class='button radius tiny' onClick='setViewMode(); return false;'>OK</a>";
    view += "</div>";

    data.elementId = elementId;
    data.parentId = parentId;
    self.createViewElement( elementId, view );
    self.setEditMode();

    data.treeNode.setName( self.renderHighlightLink( elementId + "_content", data.treeNode.getName(), "AttachmentsList" ) );

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
  var content = "[{/OpenForum/Extensions/AttachmentsList targetPage='" + data.data['targetPage'] + "' matching='" + data.data['matching'] + "' actions='" + data.data['actions'] + "' }]";

  return content;
};
};

AttachmentsListBlockEditor.prototype = new BlockPrototype("","{{blockIcon}}");

AttachmentsListBlockEditor.template = {
  "block": "attachmentsList",
  "data": {

     "targetPage": "",

     "matching": "",

     "actions": "",

    "id": ""
  }
};
