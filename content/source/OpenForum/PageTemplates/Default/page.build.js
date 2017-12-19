//Should use link to /OpenForum/Javascript/PageBuilder
var htmlContent = "";
if(pageName.charAt(0)!="/") pageName = "/"+pageName;

try{

  var pageTemplate = file.getPageInheritedFileAsString(pageName,"page.html.template");
  if( pageTemplate===null ) {
    // Get header content
    var headerTemplate = ""+file.getPageInheritedFileAsString(pageName,"header.html.template");
    // Get footer content
    var footerTemplate = ""+file.getPageInheritedFileAsString(pageName,"footer.html.template");

    pageTemplate = headerTemplate + "<!-- Page Content -->" + "&content;" + "<!-- End of Page Content -->" + footerTemplate;
    // Insert inserts
  } else {
    pageTemplate = ""+pageTemplate;
  }

  var savePage = true;
  var errors = "";
  var contentBuilder = "default";
  var renderer = js.getObject("/OpenForum/Javascript/Renderer","DefaultRenderer.sjs");
  var timestamp = new Date().getTime();

  if (file.attachmentExists(pageName,"page.content")===false) {
    file.saveAttachment(pageName,"page.content","");
    log.info("Created empy page.content for "+pageName);
  }
  if (file.attachmentExists(pageName,"page.js")===false) {
    file.saveAttachment(pageName,"page.js","");
    log.info("Created empy page.js for "+pageName);
  }
  if (file.attachmentExists(pageName,"data.json")===false) {
    file.saveAttachment(pageName,"data.json","{}");
    log.info("Created empy data.json for "+pageName);
  }

  if(typeof(content)==="undefined") {
    errors += "<li>No content supplied by caller</li>";
    content = file.getAttachment(pageName,"page.content");
    timestamp = file.getAttachmentTimestamp(pageName,"page.content");
    if(content===null) {
      errors += "<li>No content found at "+pageName+"/page.content</li>";
      content = file.getAttachment(pageName,"page.wiki"); // deprecated
      timestamp = file.getAttachmentTimestamp(pageName,"page.wiki");

      log.warning("Content in page.wiki for "+pageName+" should be moved to page.content. page.wiki deprecated");
      if(content===null) {
        errors += "<li>No content found at "+pageName+"/page.wiki (deprecated)</li>";

        log.warning("No content for "+pageName);
      }
    }
  } else {
    savePage = false;
    content = ""+content;
  }

  if(!content) {
    htmlContent = "Page content missing. Errors: <ul>"+errors+"</ul> Content:["+content+"]";
  } else {
    htmlContent = ""+content;

    if(htmlContent.indexOf("\n")>0) {
      var firstLine = htmlContent.substring(0,htmlContent.indexOf("\n"));
      if(firstLine.substring(0,19)==="<!--contentBuilder=") {
        contentBuilder = firstline.substring(19,firstLine.indexOf("-->"));
      }
    }

  }

  //log.debug("Content loaded for "+pageName);  

  htmlContent = htmlContent + "\n<!--Content built using "+contentBuilder+" builder and renderer "+renderer.getVersion()+"-->";

  if(savePage===true) file.saveAttachment(pageName,"page.html.fragment",renderer.render(pageName,htmlContent));

  htmlContent = pageTemplate.replace("&content;","\n"+htmlContent+"\n");

  var fields = [];
  fields["pageName"] = pageName;
  fields["title"] = openForum.wikiToTitleName(pageName);

  shortTitle = fields["title"];
  if(shortTitle.length>20) {
    shortTitle = "..."+shortTitle.substring(shortTitle.length-17);
  }  
  fields["shortTitle"] = shortTitle;

  fields["author"] = "unknown";
  fields["lastChangedBy"] = "unknown";
  fields["referringPages"] = "";
  fields["attachments"] = "";
  fields["tags"] = "";
  fields["time"] = timestamp;

  // Replace template fields
  var stepCount = 0;
  var MAX_STEP_COUNTS = 10000;
  var MAX_PAGE_LENGTH = 1000000;

  //openForum.postMessageToQueue("test","Buidling Page:(" +pageName+ ") File:(page.html)"); 

  var searchData = htmlContent;
  htmlContent = "";
  while( searchData.indexOf("&")!=-1 ) {

    stepCount++;
    if(stepCount>MAX_STEP_COUNTS) break;

    var indexStart = searchData.indexOf("&");
    htmlContent += searchData.substring(0,indexStart);
    searchData = searchData.substring(indexStart+1);

    var endIndex = searchData.indexOf(";");
    if(endIndex==-1) {
      htmlContent += "&";
      break;
    }

    var fieldName = searchData.substring(0,endIndex);
    if( typeof(fields[fieldName])!=="undefined" ) {
      htmlContent += fields[fieldName];
      searchData = searchData.substring(endIndex+1);
    } else if(fieldName.indexOf("insert:")===0) {
      var insertFile = fieldName.substring(7);
      var insertPageName = ""+insertFile.substring(0,insertFile.lastIndexOf("/"));
      var insertFileName = ""+insertFile.substring(insertFile.lastIndexOf("/")+1);
      searchData = searchData.substring(endIndex+1);

      if(file.attachmentExists(insertFile,"page.html.fragment")) {
        searchData = "<!-- insert (" +insertFile+ ") start -->" + file.getAttachment(insertFile,"page.html.fragment") + "<!-- insert (" +insertFile+ ") end -->" + searchData;
      } else if(file.attachmentExists(insertPageName,insertFileName)) {
        searchData = "<!-- insert (" +insertFile+ ") start -->" + file.getAttachment(insertPageName,insertFileName) + "<!-- insert (" +insertFile+ ") end -->" + searchData;
      } else {
        searchData = "<!-- insert not found (" +insertFile+ ") -->" + searchData;
      }
    } else {
      htmlContent += "&";
    }

    if(htmlContent>MAX_PAGE_LENGTH) {
      htmlContent += "<!-- Truncated. Content too long. -->";
      break;
    }
  }
  htmlContent += searchData;
  try{
    htmlContent = renderer.render(pageName,htmlContent);
  } catch(e) {
    log.error("Failed to render renderer "+renderer.getType()+" on "+pageName+" using /OpenForum/PageTemplates/Default/page.build.js. Exception "+e+" on line number "+e.lineNumber);
  }

  //log.debug("Content built for "+pageName);

  if(savePage===true) file.saveAttachment(pageName,"page.html",htmlContent);

  htmlContent = ""+htmlContent;

  log.info("Built "+pageName);

} catch(e) {
  log.error("Failed to build "+pageName+" using /OpenForum/PageTemplates/Default/page.build.js. Exception "+e+" on line number "+e.lineNumber);
}