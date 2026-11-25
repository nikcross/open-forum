/*
* POST actions for the content editor's saved pages (CON-T-024/025) and
* publishing (CON-T-030),
* added by hand - see ContentPages.sjs. Every write is checked with
* transaction.userCanPerformAction on the page it changes.
*/
var action = transaction.getParameter("action");
if(action===null) {
    transaction.setResult(transaction.SHOW_PAGE);
    return;
}

try{
action = ""+action;
result = {result: "error", message: "Action "+action+" not recognised."};

transaction.getPostData();
var user = transaction.getUser();
var authorise = function(pageName) {
    transaction.userCanPerformAction(""+pageName, "update", true);
};
var required = function(name) {
    var value = transaction.getPostParameter(name);
    if(value===null) {
     throw "Request is missing required parameter "+name;
    }
    return ""+value;
};
var optional = function(name) {
    var value = transaction.getPostParameter(name);
    return value===null ? "" : ""+value;
};

if(action==="createContentPage" || action==="saveContentPage" || action==="setContentPageArchived" || action==="publishContentPage" || action==="importContentPage" || action==="moveContentPage") {
    var ContentPages = js.getObject("/OpenForum/AddOn/ContentEditor","ContentPages.sjs");

    if(action==="createContentPage") {
        var created = ContentPages.createContentPage(user, authorise, required("page"), optional("message"), optional("folder"));
        result = {result: "ok", message: "Created "+created.index.publicPath, data: created};
    }
    if(action==="saveContentPage") {
        var saved = ContentPages.saveContentPage(user, authorise, required("pageId"), required("baseRevision"), required("page"), optional("message"));
        if(saved.conflict) {
            result = {result: "conflict", message: "The page was saved by "+saved.current.actor+" ("+saved.current.id+") since you opened it", data: saved};
        } else {
            result = {result: "ok", message: "Saved "+saved.revision.id, data: saved};
        }
    }
    if(action==="publishContentPage") {
        // CON-T-030: practice unless practice is exactly "false".
        var publication = ContentPages.publishContentPage(user, authorise, required("pageId"), optional("revisionId"), optional("practice"));
        var outcome = publication.errors.length ? "Not published" : publication.published ? "Published "+publication.revision+" to "+publication.publicPath : "Practice run for "+publication.revision+" passed";
        result = {result: "ok", message: outcome, data: publication};
    }
    if(action==="importContentPage") {
        var imported = ContentPages.importContentPage(user, authorise, required("sourcePage"), required("templateId"));
        result = {result: "ok", message: "Imported "+imported.index.draftPath+" as "+imported.revision.id, data: imported};
    }
    if(action==="moveContentPage") {
        // CON-T-051: moves the Development copy only.
        var moved = ContentPages.moveContentPage(user, authorise, required("pageId"), required("path"));
        result = {result: "ok", message: "Moved "+moved.from+" to "+moved.to, data: moved};
    }
    if(action==="setContentPageArchived") {
        var index = ContentPages.setContentPageArchived(user, authorise, required("pageId"), required("archived"));
        result = {result: "ok", message: index.archived ? "Archived" : "Restored", data: index};
    }
}

// CON-T-057: a shared part's Development copy (added by hand, see ContentPages.sjs).
if(action==="saveSharedPart") {
    var savedPart = js.getObject("/OpenForum/AddOn/ContentEditor","ContentPages.sjs").saveSharedPart(user, authorise, required("path"), required("html"), required("baseVersion"));
    if(savedPart.conflict) {
        result = {result: "conflict", message: savedPart.current.path+" was saved by someone else since you opened it", data: savedPart};
    } else {
        result = {result: "ok", message: "Saved "+savedPart.part.draftPath, data: savedPart};
    }
}

// CON-T-045: the site's library (added by hand, see SiteLibrary.sjs).
if(action==="createLibraryEntry" || action==="saveLibraryEntry" || action==="updateLibraryEntry" || action==="duplicateLibraryEntry" ||
   action==="uploadImage" || action==="addLinkedImage" || action==="updateLinkedImage" ||
   action==="addImageSource" || action==="removeImageSource" || action==="replaceImage" || action==="removeImage") {
    var SiteLibrary = js.getObject("/OpenForum/AddOn/ContentEditor","SiteLibrary.sjs");
    // CON-T-049: the image library.
    if(action==="uploadImage") {
        var uploaded = SiteLibrary.uploadImage(user, authorise, required("fileName"), required("data"));
        result = {result: "ok", message: "Uploaded "+uploaded.fileName, data: uploaded};
    }
    if(action==="addLinkedImage") {
        var linked = SiteLibrary.addLinkedImage(user, authorise, required("url"), optional("name"));
        result = {result: "ok", message: "Linked "+linked.name, data: linked};
    }
    if(action==="updateLinkedImage") {
        var changedImage = SiteLibrary.updateLinkedImage(user, authorise, required("id"), required("archived"));
        result = {result: "ok", message: changedImage.archived ? "Removed "+changedImage.name : "Restored "+changedImage.name, data: changedImage};
    }
    if(action==="replaceImage") {
        var replaced = SiteLibrary.replaceImage(user, authorise, required("fileName"), required("data"));
        result = {result: "ok", message: "Replaced "+replaced.fileName+"; the old picture is kept as "+replaced.keptAs, data: replaced};
    }
    if(action==="removeImage") {
        var removed = SiteLibrary.removeImage(user, authorise, required("fileName"));
        result = {result: "ok", message: "Removed "+removed.fileName+"; it is kept as "+removed.keptAs, data: removed};
    }
    if(action==="addImageSource") {
        var addedSource = SiteLibrary.addImageSource(user, authorise, required("pageName"));
        result = {result: "ok", message: "Added "+addedSource.pageName+" as an image source", data: addedSource};
    }
    if(action==="removeImageSource") {
        var removedSource = SiteLibrary.removeImageSource(user, authorise, required("id"));
        result = {result: "ok", message: "Removed "+removedSource.pageName+" from the image sources", data: removedSource};
    }
    if(action==="createLibraryEntry") {
        var createdEntry = SiteLibrary.createLibraryEntry(user, authorise, required("kind"), required("name"), required("content"), optional("message"));
        result = {result: "ok", message: "Created "+createdEntry.name, data: createdEntry};
    }
    if(action==="saveLibraryEntry") {
        var savedEntry = SiteLibrary.saveLibraryEntry(user, authorise, required("kind"), required("id"), required("baseVersion"), required("content"), optional("message"));
        if(savedEntry.conflict) {
            result = {result: "conflict", message: savedEntry.current.name+" was saved by "+savedEntry.current.savedBy+" (version "+savedEntry.current.version+") since you opened it", data: savedEntry};
        } else {
            result = {result: "ok", message: "Saved "+savedEntry.name+" version "+savedEntry.version, data: savedEntry};
        }
    }
    if(action==="updateLibraryEntry") {
        var updatedEntry = SiteLibrary.updateLibraryEntry(user, authorise, required("kind"), required("id"), optional("name"), optional("archived"));
        result = {result: "ok", message: updatedEntry.archived ? "Archived "+updatedEntry.name : "Updated "+updatedEntry.name, data: updatedEntry};
    }
    if(action==="duplicateLibraryEntry") {
        var copiedEntry = SiteLibrary.duplicateLibraryEntry(user, authorise, required("kind"), required("id"), required("name"));
        result = {result: "ok", message: "Created "+copiedEntry.name, data: copiedEntry};
    }
}

} catch(e) {
  // Refusals are thrown as plain text and shown to the person as they are.
  var message = typeof e === "string" ? e : "Error:"+e+" on line "+e.lineNumber+" of "+e.sourceName;
  transaction.sendJSON( JSON.stringify({result: "error",message: message}));
  return;
}

transaction.sendJSON( JSON.stringify(result) );

