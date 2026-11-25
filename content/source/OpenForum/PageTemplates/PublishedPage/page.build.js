var htmlContent = "";
if(pageName.charAt(0)!="/") pageName = "/"+pageName;

var VERSION = "x0.0.4 February Promise";
var contentBuilder = "/OpenForum/PageTemplates/PublishedPage/page.build.js "+VERSION;

try{

  var applyFields = function( pageName, timestamp, htmlContent ) {
    var fields = [];
    fields["pageName"] = pageName;
    fields["title"] = openForum.wikiToTitleName(pageName);
    fields["shortTitle"] = openForum.wikiToTitleName(pageName);
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
        if(insertFile.indexOf("/")!=0) insertFile = pageName +"/"+ insertFile;
        var insertPageName = ""+insertFile.substring(0,insertFile.lastIndexOf("/"));
        var insertFileName = ""+insertFile.substring(insertFile.lastIndexOf("/")+1);
        searchData = searchData.substring(endIndex+1);

        if(file.attachmentExists(insertFile,"page.html.fragment")) {
          searchData = "<!-- insert (" +insertFile+ ") start -->" + file.getAttachment(insertFile,"page.html.fragment") + "<!-- insert (" +insertFile+ ") end -->" + searchData;
        } else if(file.attachmentExists(insertPageName,insertFileName)) {
          searchData = "<!-- insert (" +insertFile+ ") start -->" + file.getAttachment(insertPageName,insertFileName) + "<!-- insert (" +insertFile+ ") end -->" + searchData;
        } else {
          searchData = "<!-- insert not found ( page:" +insertPageName+" file:"+insertFileName+ ") -->" + searchData;
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
      log.error("Failed to render renderer "+renderer.getType()+" on "+pageName+" using "+contentBuilder+". Exception "+e+" on line number "+e.lineNumber);
    }
    return htmlContent;
  };

  // --- Build content fragments  

  var attachments=[];
  //var pageName = "/Sandbox";
  var matching = ".*\\.wiki\\.fragment"; //Regex include all wiki fragments

  var list = file.getAttachmentsForPage( pageName );
  if(pageName.charAt(0)!='/')
  {
    pageName = "/"+pageName;
  }

  var iterator= list.keySet().iterator();
  while(iterator.hasNext())
  {
    var key = ""+iterator.next();
    var item;
    if(key.charAt(0)==='+') { // ignore sub pages
      continue;
    } else if(key.search( matching )==-1 ) {
      continue;
    } else {
      var name = key.substring(0,key.indexOf(".wiki.fragment"));
      var content = file.getAttachment(pageName,key);
      file.saveAttachment(pageName,name+".html.fragment",renderer.render(pageName,content));
    }
  }

  // --- End Build

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

  var htmlFragment = "<!--Content built using "+contentBuilder+" builder and renderer "+renderer.getVersion()+"-->\n" + htmlContent;
  htmlFragment = applyFields( pageName, timestamp, htmlFragment );
  if(savePage===true) {
    file.saveAttachment(pageName,"page.html.fragment",renderer.render(pageName,htmlFragment));
  }

  htmlContent = htmlContent + "\n<!--Content built using "+contentBuilder+" builder and renderer "+renderer.getVersion()+"-->";
  htmlContent = pageTemplate.replace("&content;","\n"+htmlContent+"\n");

  htmlContent = applyFields( pageName, timestamp, htmlContent );

    //log.debug("Content built for "+pageName);

    if(savePage===true) {
      file.saveAttachment(pageName,"page.html",htmlContent);
    }
  log.info("Built "+pageName+" save:"+savePage);

  htmlContent = ""+htmlContent;

} catch(e) {
  message = "Failed to build "+pageName+" using "+contentBuilder+". Exception "+e+" on line number "+e.lineNumber;
  log.error(message);
  //htmlContent = message;
}