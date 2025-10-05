/*
* Author: 
* Description: 
*/
var WYSIWYGBlockEditor = function(data, parentId) {
  var self = this;
  self.setData( data );
  
  var ckEditor;

  self.initView = function(elementId) {
    //OpenForum.getObject( elementId + "_edit" ).setValue( data.data.text );
    //OpenForum.addListener( elementId + "_edit", function( obj ) { data.data.text=obj.getValue(); } );

    var view = "<div class='row' style='border: solid 2px white;' id='" + elementId + "_edit" + "'>" +
        "<textarea id='" + elementId + "_content" + "' of-id='" + elementId + "_text" + "'>" + data.data.text + "</textarea>";
    view += self.renderBottomButtons( elementId );
    view += "</div>";

    data.elementId = elementId;
    data.parentId = parentId;
    OpenForum.setElement( elementId, view );
    
    data.treeNode.setName( self.renderHighlightLink( elementId+"_edit", data.treeNode.getName(), "WYSIWYG Block" ) );

    //See https://ckeditor.com/docs/ckeditor5/latest/builds/guides/integration/configuration.html#adding-simple-standalone-features to add plugin
    //See https://ckeditor.com/docs/ckeditor5/latest/features/images/image-upload/simple-upload-adapter.html to upload images
    new Process().waitFor(
      function() { return (typeof ClassicEditor != undefined); }
    ).then( function() {
      ClassicEditor
        .create( document.getElementById( elementId + "_content" ), 
                // https://ckeditor.com/docs/ckeditor5/latest/api/module_core_editor_editorconfig-EditorConfig.html
        {
        	toolbar: ["heading", "|", "bold", "italic", "link", "bulletedList", "numberedList", "|", "outdent", "indent", "|", "blockQuote", "insertTable", "mediaEmbed", "undo", "redo" ]
      	} )
        .then( newEditor => {
        ckEditor = newEditor;
        ckEditor.setData( data.data.text );
        //self.setValue(source);
        //checkForChanges();
      } )
        .catch( error => {
        console.error( error );
      } );
    }).run();

  };https://open-forum.onestonesoup.org/OpenForum/Editor?pageName=/OpenForum/AddOn/ContentEditor#
  
  self.initTree = function(treeNode) {
    var node = treeNode.addChild( "WYSIWYG Block",{icon: "page_edit"} );
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
    data.data.text = ckEditor.getData();
    return data.data.text;
  };

  self.setViewMode = function() {
    data.data.text = ckEditor.getData();
    return data.data.text;
  };

  self.render = function() {
    data.data.text = ckEditor.getData();
    return data.data.text;
  };
};

WYSIWYGBlockEditor.prototype = new BlockPrototype("WYSIWYG");

WYSIWYGBlockEditor.template = {
  "block": "WYSIWYG",
  "data": {
    "text": ""
  },
  "elementId": "",
  "editor": {},
  "blockEditor": {}
};

