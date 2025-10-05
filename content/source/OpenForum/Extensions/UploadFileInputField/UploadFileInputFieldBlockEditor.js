/*
* Built By: /OpenForum/AddOn/ServiceBuilder
* Description: v0.0.5
*/
var UploadFileInputFieldBlockEditor = function(data, parentId) {
  var self = this;
  self.setData( data );

  self.initView = function(elementId) { 

    
    OpenForum.getObject( elementId + "_name" ).setValue( data.data.name );
    OpenForum.addListener( elementId + "_name", function( obj ) { data.data.name=obj.getValue(); } );

    OpenForum.getObject( elementId + "_targetPageName" ).setValue( data.data.targetPageName );
    OpenForum.addListener( elementId + "_targetPageName", function( obj ) { data.data.targetPageName=obj.getValue(); } );

    OpenForum.getObject( elementId + "_text" ).setValue( data.data.text );
    OpenForum.addListener( elementId + "_text", function( obj ) { data.data.text=obj.getValue(); } );

    OpenForum.getObject( elementId + "_message" ).setValue( data.data.message );
    OpenForum.addListener( elementId + "_message", function( obj ) { data.data.message=obj.getValue(); } );


    var view = "<div class='row' id='" + elementId + "_view" + "' style='display: block;'>";


    view += "<div id='" + elementId + "_rendered" + "'>Loading...</div>";
    
    view += self.renderEditButton( elementId );
    view += self.renderBottomButtons( elementId );
    view += "</div>";

    view += "<div class='row' id='" + elementId + "_edit" + "'  style='display: none; border: solid 2px blue;'>";

	
  view += "name: <input type='text' of-id='" + elementId + "_name" + "' value='" +data.data.name + "'/>";

  view += "targetPageName: <input type='text' of-id='" + elementId + "_targetPageName" + "' value='" +data.data.targetPageName + "'/>";

  view += "text: <input type='text' of-id='" + elementId + "_text" + "' value='" +data.data.text + "'/>";

  view += "message: <input type='text' of-id='" + elementId + "_message" + "' value='" +data.data.message + "'/>";


    view += "<a class='button radius tiny' onClick='setViewMode(); return false;'>OK</a>";
    view += "</div>";

    data.elementId = elementId;
    data.parentId = parentId;
    self.createViewElement( elementId, view );
    self.setEditMode();

    data.treeNode.setName( self.renderHighlightLink( elementId + "_content", data.treeNode.getName(), "UploadFileInputField" ) );

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
  var content = "[{/OpenForum/Extensions/UploadFileInputField name='" + data.data['name'] + "' targetPageName='" + data.data['targetPageName'] + "' text='" + data.data['text'] + "' message='" + data.data['message'] + "' }]";

  return content;
};
};

UploadFileInputFieldBlockEditor.prototype = new BlockPrototype("","{{blockIcon}}");

UploadFileInputFieldBlockEditor.template = {
  "block": "uploadFileInputField",
  "data": {

     "name": "",

     "targetPageName": "",

     "text": "",

     "message": "",

    "id": ""
  }
};
