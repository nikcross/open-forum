/*
* Built By: /OpenForum/AddOn/ServiceBuilder
* Description: v0.1.34
*/
var OpeningTimesBlockEditor = function(data, parentId) {
  var self = this;
  self.setData( data );

  self.initView = function(elementId) { 

    
    OpenForum.getObject( elementId + "_mondayOpen" ).setValue( data.data.mondayOpen );
    OpenForum.addListener( elementId + "_mondayOpen", function( obj ) { data.data.mondayOpen=obj.getValue(); } );

    OpenForum.getObject( elementId + "_mondayClose" ).setValue( data.data.mondayClose );
    OpenForum.addListener( elementId + "_mondayClose", function( obj ) { data.data.mondayClose=obj.getValue(); } );

    OpenForum.getObject( elementId + "_tuesdayOpen" ).setValue( data.data.tuesdayOpen );
    OpenForum.addListener( elementId + "_tuesdayOpen", function( obj ) { data.data.tuesdayOpen=obj.getValue(); } );

    OpenForum.getObject( elementId + "_tuesdayClose" ).setValue( data.data.tuesdayClose );
    OpenForum.addListener( elementId + "_tuesdayClose", function( obj ) { data.data.tuesdayClose=obj.getValue(); } );

    OpenForum.getObject( elementId + "_wednesdayOpen" ).setValue( data.data.wednesdayOpen );
    OpenForum.addListener( elementId + "_wednesdayOpen", function( obj ) { data.data.wednesdayOpen=obj.getValue(); } );

    OpenForum.getObject( elementId + "_wednesdayClose" ).setValue( data.data.wednesdayClose );
    OpenForum.addListener( elementId + "_wednesdayClose", function( obj ) { data.data.wednesdayClose=obj.getValue(); } );

    OpenForum.getObject( elementId + "_thursdayOpen" ).setValue( data.data.thursdayOpen );
    OpenForum.addListener( elementId + "_thursdayOpen", function( obj ) { data.data.thursdayOpen=obj.getValue(); } );

    OpenForum.getObject( elementId + "_thursdayClose" ).setValue( data.data.thursdayClose );
    OpenForum.addListener( elementId + "_thursdayClose", function( obj ) { data.data.thursdayClose=obj.getValue(); } );

    OpenForum.getObject( elementId + "_fridayOpen" ).setValue( data.data.fridayOpen );
    OpenForum.addListener( elementId + "_fridayOpen", function( obj ) { data.data.fridayOpen=obj.getValue(); } );

    OpenForum.getObject( elementId + "_fridayClose" ).setValue( data.data.fridayClose );
    OpenForum.addListener( elementId + "_fridayClose", function( obj ) { data.data.fridayClose=obj.getValue(); } );

    OpenForum.getObject( elementId + "_saturdayOpen" ).setValue( data.data.saturdayOpen );
    OpenForum.addListener( elementId + "_saturdayOpen", function( obj ) { data.data.saturdayOpen=obj.getValue(); } );

    OpenForum.getObject( elementId + "_saturdayClose" ).setValue( data.data.saturdayClose );
    OpenForum.addListener( elementId + "_saturdayClose", function( obj ) { data.data.saturdayClose=obj.getValue(); } );

    OpenForum.getObject( elementId + "_sundayOpen" ).setValue( data.data.sundayOpen );
    OpenForum.addListener( elementId + "_sundayOpen", function( obj ) { data.data.sundayOpen=obj.getValue(); } );

    OpenForum.getObject( elementId + "_sundayClose" ).setValue( data.data.sundayClose );
    OpenForum.addListener( elementId + "_sundayClose", function( obj ) { data.data.sundayClose=obj.getValue(); } );


    var view = "<div class='row' id='" + elementId + "_view" + "' style='display: block;'>";


    view += "<div id='" + elementId + "_rendered" + "'>Loading...</div>";
    
    view += self.renderEditButton( elementId );
    view += self.renderBottomButtons( elementId );
    view += "</div>";

    view += "<div class='row' id='" + elementId + "_edit" + "'  style='display: none;'>";

	
  view += "mondayOpen: <input type='text' of-id='" + elementId + "_mondayOpen" + "' value='" +data.data.mondayOpen + "' onfocusout='setViewMode();'/>";

  view += "mondayClose: <input type='text' of-id='" + elementId + "_mondayClose" + "' value='" +data.data.mondayClose + "' onfocusout='setViewMode();'/>";

  view += "tuesdayOpen: <input type='text' of-id='" + elementId + "_tuesdayOpen" + "' value='" +data.data.tuesdayOpen + "' onfocusout='setViewMode();'/>";

  view += "tuesdayClose: <input type='text' of-id='" + elementId + "_tuesdayClose" + "' value='" +data.data.tuesdayClose + "' onfocusout='setViewMode();'/>";

  view += "wednesdayOpen: <input type='text' of-id='" + elementId + "_wednesdayOpen" + "' value='" +data.data.wednesdayOpen + "' onfocusout='setViewMode();'/>";

  view += "wednesdayClose: <input type='text' of-id='" + elementId + "_wednesdayClose" + "' value='" +data.data.wednesdayClose + "' onfocusout='setViewMode();'/>";

  view += "thursdayOpen: <input type='text' of-id='" + elementId + "_thursdayOpen" + "' value='" +data.data.thursdayOpen + "' onfocusout='setViewMode();'/>";

  view += "thursdayClose: <input type='text' of-id='" + elementId + "_thursdayClose" + "' value='" +data.data.thursdayClose + "' onfocusout='setViewMode();'/>";

  view += "fridayOpen: <input type='text' of-id='" + elementId + "_fridayOpen" + "' value='" +data.data.fridayOpen + "' onfocusout='setViewMode();'/>";

  view += "fridayClose: <input type='text' of-id='" + elementId + "_fridayClose" + "' value='" +data.data.fridayClose + "' onfocusout='setViewMode();'/>";

  view += "saturdayOpen: <input type='text' of-id='" + elementId + "_saturdayOpen" + "' value='" +data.data.saturdayOpen + "' onfocusout='setViewMode();'/>";

  view += "saturdayClose: <input type='text' of-id='" + elementId + "_saturdayClose" + "' value='" +data.data.saturdayClose + "' onfocusout='setViewMode();'/>";

  view += "sundayOpen: <input type='text' of-id='" + elementId + "_sundayOpen" + "' value='" +data.data.sundayOpen + "' onfocusout='setViewMode();'/>";

  view += "sundayClose: <input type='text' of-id='" + elementId + "_sundayClose" + "' value='" +data.data.sundayClose + "' onfocusout='setViewMode();'/>";



    view += "</div>";

    data.elementId = elementId;
    data.parentId = parentId;
    self.createViewElement( elementId, view );
    self.setEditMode();

    data.treeNode.setName( self.renderHighlightLink( elementId + "_content", data.treeNode.getName(), "OpeningTimes" ) );

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
  var content = "[{/OpenForum/Extensions/OpeningTimes mondayOpen='" + data.data['mondayOpen'] + "' mondayClose='" + data.data['mondayClose'] + "' tuesdayOpen='" + data.data['tuesdayOpen'] + "' tuesdayClose='" + data.data['tuesdayClose'] + "' wednesdayOpen='" + data.data['wednesdayOpen'] + "' wednesdayClose='" + data.data['wednesdayClose'] + "' thursdayOpen='" + data.data['thursdayOpen'] + "' thursdayClose='" + data.data['thursdayClose'] + "' fridayOpen='" + data.data['fridayOpen'] + "' fridayClose='" + data.data['fridayClose'] + "' saturdayOpen='" + data.data['saturdayOpen'] + "' saturdayClose='" + data.data['saturdayClose'] + "' sundayOpen='" + data.data['sundayOpen'] + "' sundayClose='" + data.data['sundayClose'] + "' }]";

  return content;
};
};

OpeningTimesBlockEditor.prototype = new BlockPrototype("Section Heading","textfield");

OpeningTimesBlockEditor.template = {
  "block": "openingTimes",
  "data": {

     "mondayOpen": "",

     "mondayClose": "",

     "tuesdayOpen": "",

     "tuesdayClose": "",

     "wednesdayOpen": "",

     "wednesdayClose": "",

     "thursdayOpen": "",

     "thursdayClose": "",

     "fridayOpen": "",

     "fridayClose": "",

     "saturdayOpen": "",

     "saturdayClose": "",

     "sundayOpen": "",

     "sundayClose": "",

    "id": ""
  }
};
