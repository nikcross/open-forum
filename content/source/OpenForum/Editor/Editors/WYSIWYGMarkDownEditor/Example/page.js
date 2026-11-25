// Example: embedding the WYSIWYG Markdown editor in an app with StandaloneEditor,
// in the same way as the Journal embeds the Simple HTML editor.
OpenForum.includeScript("/OpenForum/Editor/Editors/StandaloneEditor.js");

var exampleEditor;

OpenForum.init = function() {
  exampleEditor = new StandaloneEditor({
    flavour: "WYSIWYGMarkDown",
    // Where editor scripts are loaded from; leave it out to use the released editors
    editorsPage: "/OpenForum/Editor/Editors/",
    // IMPORTANT: set editorPage to your own page. Without it, StandaloneEditor reopens the last file
    // that any page edited with this flavour (a browser-wide record), instead of the file below
    editorPage: "/OpenForum/Editor/Editors/WYSIWYGMarkDownEditor/Example/",
    editingPageName: "/OpenForum/Editor/Editors/WYSIWYGMarkDownEditor/Example",
    editingFileName: "example.md",
    elementId: "ExampleEditor",
    // Your own page fragment instead of the standard File, Desktop and Actions bar
    ui: "/OpenForum/Editor/Editors/WYSIWYGMarkDownEditor/Example/example-ui.html.fragment",
    autoSave: true,
    canSetPageTitle: false
  });

  // getCodeMirror() becomes non-null once the editor has been created
  new Process().waitFor( function() { return exampleEditor.getCodeMirror() != null; } ).then( function() {
    // Wrap storeChanges rather than replacing it: the original keeps the local copy
    // that StandaloneEditor offers back after a crash or reload
    var keepLocalCopy = exampleEditor.storeChanges;
    exampleEditor.storeChanges = function() {
      keepLocalCopy();
      updateWordCount();
    };
    updateWordCount();
  }).run();
};

function updateWordCount() {
  var text = exampleEditor.getValue().replace(/[#*_`>|~!\[\]\-]/g, " ");
  var words = text.split(/\s+/).filter(function(word) { return word.length > 0; }).length;
  document.getElementById("wmdExampleWords").textContent = words + (words === 1 ? " word" : " words");
}

