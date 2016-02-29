//Author: Nik Cross

var attachments = [];
var attachmentsReady = false;

function setAttachments(response) {
  pageSize = response.size;
  var lastModified = new Date();
  lastModified.setTime(response.lastModified);
  pageLastModified = lastModified.getDisplayString();


  attachments = response.attachments;
  for(var ai = 0; ai< attachments.length; ai++) {
    attachments[ai].id = ai;
    attachments[ai].action = "openAttachment";
    attachments[ai].actionName = "Edit";
    attachments[ai].actionIcon = "page_edit";
    attachments[ai].icon = "tag_blue";

    var aLastModified = new Date();
    aLastModified.setTime(attachments[ai].lastModified);
    attachments[ai].lastModified = aLastModified.getDisplayString();
  }

  OpenForum.scan(document.body);
  attachmentsReady = true;
}

function openFile(openFilePageName,openFileName) {
  var newAttachment = {pageName: openFilePageName, fileName: openFileName, id: attachments.length, action: "openAttachment", actionName: "OpenEditor"};
  attachments.push(newAttachment);
  openAttachment(newAttachment.id);
}


function loadUpdatedFilesList() {
  //  document.getElementById("filesList").innerHTML="Loading...";
  JSON.get("/OpenForum/Actions/Attachments","","pageName="+pageName+"&metaData=true").onSuccess( setAttachments ).go();
}

/*function updateFilesList(result) {
	attachments = result.attachments;
}*/

function forkAttachment(attachmentId) {
  var sourceAttachment = attachments[attachmentId];
  //alert("Fork"+sourceAttachment.pageName+" : "+sourceAttachment.fileName);
  var result = JSON.parse( OpenForum.loadFile("/OpenForum/Actions/ForkLink?pageName="+sourceAttachment.pageName+"&fileName="+sourceAttachment.fileName ));

  var newAttachment = {pageName: result.pageName, fileName: result.newFileName, id: attachments.length, action: "openAttachment", actionName: "OpenEditor"};
  attachments.push(newAttachment);
  openAttachment(newAttachment.id);
}


function saveAttachments() {
  showStatus("Saving all changes");
  if(hasChanges()) {
    for(var attachmentIndex in attachments) {
      if(attachments[attachmentIndex].editor && attachments[attachmentIndex].editor.changed=="*") {
        saveAttachment(attachmentIndex);
      }
    }
    showStatus("All changes saved.");
  } else {
    showStatus("No files have been changed.");
  }
}

function saveAttachment(attachmentIndex) {
  var fileToSave = attachments[attachmentIndex].pageName + "/" + attachments[attachmentIndex].fileName;
  var data = attachments[attachmentIndex].editor.editor.getValue();
  var result = OpenForum.saveFile(fileToSave,data);
  if(result.saved===true && attachments[attachmentIndex].editor) {
    attachments[attachmentIndex].editor.changed=" ";
    showStatus("Saved "+fileToSave);
  } else {
    showStatus("Failed to save "+fileToSave+" :"+result);
  }
}

function createAttachment(createBlankFile) {
  var ai = attachments.length;
  attachments.push({});
  attachments[ai].id = ai;
  attachments[ai].fileName = newAttachmentName;
  attachments[ai].pageName = pageName;
  attachments[ai].action = "openAttachment";
  attachments[ai].actionName = "Open Editor";
  attachments[ai].icon = "tag_blue";

  if(OpenForum.file.attachmentExists(pageName,attachments[ai].fileName)==="false") {
    var fileToSave = pageName + "/" + attachments[ai].fileName;
    var data = "";
    if(createBlankFile) {
      var result = OpenForum.saveFile(fileToSave,data);
      if(result.saved===true) {
        showStatus("Created "+fileToSave);
        openAttachment(ai);
      } else {
        showStatus("Failed to create "+fileToSave+" :"+result);
      }
    } else {
      openAttachment(ai);
      attachments[ai].editor.changed="*";
    }
  }
}

function saveFile(pageName,fileName) {
  var attachment = findAttachment(fileName);
  saveAttachment(attachment.id);
}

function findAttachment(fileName) {
  for(var ai in attachments) {
    if(attachments[ai].fileName==fileName) {
      return attachments[ai];
    }
  }
  return null;
}

function openAttachments(fileNames) {

  var editorToWaitFor=editorList.length-1;

  if( newPage ) {
    for(var i in fileNames) {
      var fileName = fileNames[i];
      var attachment = findAttachment(fileName);

      if(attachment===null) {
        newAttachmentName = fileName;
        console.log("Creating attachment "+fileName);
        createAttachment(false);
      }
    }
  }

  for(var i=0; i<fileNames.length ; i++) {

    var fileName = fileNames[i];
    var attachment = findAttachment(fileName);

    if(attachment!==null) {
      new Process().
      waitFor( 
        function(id) {
          return function() { 
            if(document.getElementById(id)!==null && document.getElementById(id).clientHeight<10) {
              document.getElementById(id).style.display = "block";
            }                
            return (document.getElementById(id)!==null && document.getElementById(id).clientHeight>=10);
          };
        }("editor"+editorToWaitFor)
      ).
      then( 
        function(id) {
          return function() {                  
            openAttachment(id);
          };
        } (attachment.id)
      ).
      run();

      editorToWaitFor++;

    }
  }
      new Process().
      waitFor( 
        function(id) {
          return function() { 
            if(document.getElementById(id)!==null && document.getElementById(id).clientHeight<10) {
              document.getElementById(id).style.display = "block";
            }                
            return (document.getElementById(id)!==null && document.getElementById(id).clientHeight>=10);
          };
        }("editor"+editorToWaitFor)
      ).
      then( 
        function(id) {
          return function() {                  
            showStatus("ready");
            showTab(0);
          };
        }()
      ).
      run();
}

function findAttachmentEditor(pageName,fileName) {
  for(var i in editorList) {
    var editor = editorList[i];
    if(editor.pageName===pageName && editor.fileName===fileName) {
      return editor;
    }
  }
  return null;
}

function openAttachment(attachmentId) {
  var fileName = attachments[attachmentId].fileName;
  var pageName = attachments[attachmentId].pageName;

  showStatus("Opening "+pageName+"/"+fileName);
  
  var editor = findAttachmentEditor(pageName,fileName);
  if(editor===null) {
    var flavour = "text";
    if(fileName.indexOf(".js")==fileName.length-3) {
      flavour = "javascript";
    } else if(fileName.indexOf(".sjs")==fileName.length-4) {
      flavour = "javascript";
    } else if(fileName.indexOf(".json")==fileName.length-5) {
      flavour = "javascript";
    } else if(fileName.indexOf(".css")==fileName.length-4) {
      flavour = "css";
    } else if(fileName.indexOf(".wiki")==fileName.length-5) {
      flavour = "html";
    } else if(fileName.indexOf(".content")==fileName.length-8) {
      flavour = "html";
    } else if(fileName.indexOf(".html")==fileName.length-5) {
      flavour = "html";
    } else if(fileName.indexOf(".html.template")==fileName.length-14) {
      flavour = "html";
    } else if(fileName.indexOf(".html.fragment")==fileName.length-14) {
      flavour = "html";
    } else if(fileName.indexOf(".xml")==fileName.length-4) {
      flavour = "xml";
    }
    editor = addEditor(pageName,fileName,flavour);
  }
  showTab(editor.id);

  editor.attachment = attachments[attachmentId];
  attachments[attachmentId].action = "saveAttachment";
  attachments[attachmentId].actionName = "Save";
  attachments[attachmentId].actionIcon = "page_save";
  attachments[attachmentId].editor = editor;

  //addTreeLeaf(attachments,attachmentId);
}

