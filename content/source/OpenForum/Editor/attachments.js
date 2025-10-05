//Author: Nik Cross

var attachments = [];
var attachmentsReady = false;

function setAsScrapAttachment() {
  newAttachmentName = "scrap.";
  //OpenForum.scan();
}

function setAsAttachment(fileName) {
  newAttachmentName = fileName;
  createAttachment(true);
  attachment = findAttachment("script.build.json");
  openAttachment(attachment.id);
  OpenForum.scan();
}

function setAttachments(response) {
  pageSize = response.size;
  var lastModified = new Date();
  lastModified.setTime(response.lastModified);
  pageLastModified = lastModified.getDisplayString();


  var newAttachments = response.attachments;
  for(var ai = 0; ai< newAttachments.length; ai++) {
    var attachment = newAttachments[ai];


    for(var aj = 0; aj< attachments.length; aj++) {
      if(attachments[aj].editor) {
        if(attachments[aj].fileName == attachment.fileName && attachments[aj].pageName == attachment.pageName) {
          attachment.editor = attachments[aj].editor;
        }
      }
    }

    attachment.id = ai;
    attachment.extension = attachment.fileName.substring(attachment.fileName.lastIndexOf("."));
    attachment.action = "openAttachment";
    attachment.action = "openAttachment";
    attachment.actionName = "Edit";
    attachment.actionIcon = "/OpenForum/Images/icons/png/page_edit.png";
    attachment.icon = "/OpenForum/Images/icons/png/tag_blue.png";
    attachment.extraActions = "";

    if(attachment.extension==".zip") {
      attachment.action = "unzipAttachment";
      attachment.actionName = "Unzip";
      attachment.actionIcon = "/OpenForum/Images/icons/png/compress.png";
    } else if(attachment.extension==".link") {
      attachment.extraActions = "<a class=\"button tiny\" onClick=\"forkAttachment('"+attachment.id+"'); return false;\">Fork</a>";
    } else if(attachment.extension.toLowerCase()==".png" || attachment.extension.toLowerCase()==".jpg" || attachment.extension.toLowerCase()==".gif") {
      attachment.action = "viewAttachment";
      attachment.actionName = "View";
      attachment.actionIcon = "/OpenForum/Images/icons/png/eye.png";
    }

    var aLastModified = new Date();
    aLastModified.setTime(attachment.lastModified);
    attachment.lastModified = aLastModified.getDisplayString();
  }
  attachments = newAttachments;

  OpenForum.scan(document.body);
  
  updateAttachmentsFilter();
  attachmentsReady = true;
}

function openFile(openFilePageName,openFileName) {
  var newAttachment = {pageName: openFilePageName, fileName: openFileName, id: attachments.length, action: "openAttachment", actionName: "OpenEditor"};
  attachments.push(newAttachment);
  openAttachment(newAttachment.id);
}

function deleteFile(attachmentPageToDelete,attachmentToDelete) {
  var result = OpenForum.deleteFile(attachmentPageToDelete,attachmentToDelete);
  loadUpdatedFilesList();
  if(result===false) {
    alert("The file " + attachmentPageToDelete + "/" + attachmentToDelete + " was not deleted (it may be read only).<br/>It has been marked for deletion in a future release.");
  }
}

function loadUpdatedFilesList() {
  //  document.getElementById("filesList").innerHTML="Loading...";
  JSON.get("/OpenForum/Actions/Attachments","","pageName="+pageName+"&metaData=true").onSuccess( setAttachments ).go();
}

/*function updateFilesList(result) {
	attachments = result.attachments;
}*/

function viewAttachment(attachmentId) {
  var sourceAttachment = attachments[attachmentId];
  window.open(sourceAttachment.pageName+"/"+sourceAttachment.fileName,"viewtab");
}

function unzipAttachment(attachmentId) {
  var sourceAttachment = attachments[attachmentId];
  var result = JSON.parse( OpenForum.loadFile("/OpenForum/Actions/Zip?action=unzip&pageName="+sourceAttachment.pageName+"&fileName="+sourceAttachment.fileName ));

  updateOverview();
}

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
  if(attachments[attachmentIndex].fileName.startsWith("scrap.")) {
    alert("Scrap files are not saved");
    return;
  }

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
  attachments[ai].icon = "/OpenForum/Images/icons/png/tag_blue.png";
  attachments[ai].extension = "";
  attachments[ai].lastModified = "";
  attachments[ai].extraActions = "";

  if(OpenForum.file.attachmentExists(attachments[ai].pageName,attachments[ai].fileName)==="false") {
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
      if(attachments[ai].fileName.startsWith("scrap.")) {
        attachments[ai].editor.changed=" ";
      } else {
        attachments[ai].editor.changed="*";
      }
    }
  }
  return attachments[ai];
}

function saveFile(aPageName,fileName) {
  var attachment = findAttachment(aPageName,fileName);
  if(attachment == null) {
    newAttachmentName = fileName;
    attachment = createAttachment(false);
    if(aPageName != pageName) {
      attachment.pageName = aPageName;
    }
    attachment = findAttachment(aPageName,fileName);
  }
  saveAttachment(attachment.id);
}

function findAttachment(aPageName,fileName) {
  var usePageName = true;
  if(!fileName) {
    fileName = aPageName;
    usePageName = false;
  }
  for(var ai in attachments) {
    if(attachments[ai].fileName==fileName) {
      if(!usePageName || attachments[ai].pageName==aPageName) {
        return attachments[ai];
      }
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

function getFlavour( fileName ) {
  var flavour = "text";
  if(fileName.indexOf(".link")==fileName.length-5) {
    flavour = "link";
  } else if(fileName.indexOf(".js")==fileName.length-3) {
    flavour = "javascript";
  } else if(fileName.indexOf(".sjs")==fileName.length-4) {
    flavour = "javascript";
  } else if(fileName.indexOf(".json")==fileName.length-5) {
    flavour = "javascript";
  } else if(fileName.indexOf(".css")==fileName.length-4) {
    flavour = "css";
  } else if(fileName.indexOf(".sql")==fileName.length-4) {
    flavour = "sql";
  } else if(fileName.indexOf(".py")==fileName.length-3) {
    flavour = "python";
  } else if(fileName.indexOf(".wiki")==fileName.length-5) {
    flavour = "html";
  } else if(fileName.indexOf(".wiki.fragment")==fileName.length-14) {
    flavour = "html";
  } else if(fileName.indexOf(".wiki.template")==fileName.length-14) {
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
  return flavour;
}

function openAttachment(attachmentId) {
  var fileName = attachments[attachmentId].fileName;
  var pageName = attachments[attachmentId].pageName;

  showStatus("Opening "+pageName+"/"+fileName);

  var editor = findAttachmentEditor(pageName,fileName);
  if(editor===null) {
    var flavour = getFlavour( fileName );
    editor = addEditor(pageName,fileName,flavour);
  }
  showTab(editor.id);

  editor.attachment = attachments[attachmentId];
  attachments[attachmentId].action = "saveAttachment";
  attachments[attachmentId].actionName = "Save";
  attachments[attachmentId].actionIcon = "/OpenForum/Images/icons/png/page_save.png";
  attachments[attachmentId].editor = editor;

  //addTreeLeaf(attachments,attachmentId);
}

function updateAttachmentsFilter() {
  if(typeof fileNameFilter == "undefined") return;
  if(typeof attachments == "undefined") return;

  OpenForum.scan();
  OpenForum.Table.applyRowFilter("attachments",attachments,"fileName",fileNameFilter);
}
