/*
* Author: 
*/
OpenForum.includeScript("/OpenForum/Javascript/CKEditor/ck-classic-editor.js");
var ckEditor;

OpenForum.init = function() {

  ClassicEditor
    .create( document.getElementById( "ck_content" ), 
            // https://ckeditor.com/docs/ckeditor5/latest/api/module_core_editor_editorconfig-EditorConfig.html
            {
    toolbar: ["heading", "|", "bold", "italic", "link", "bulletedList", "numberedList", "|", "outdent", "indent", "|", "blockQuote", "insertTable", "mediaEmbed", "undo", "redo" ]
  } )
    .then( newEditor => {
    ckEditor = newEditor;
    //ckEditor.setData( text );
    //self.setValue(source);
    //checkForChanges();
    //
    ckEditor.model.document.on('change:data', (evt, data) => {
      console.log(ckEditor.getData());
    });
  } )
    .catch( error => {
    console.error( error );
  } );
};
