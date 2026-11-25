/*
* Page builder for pages published from the Content Editor (CON-T-030).
* A content page links to this from page.build.js.link.
*
* The default builder runs page.content through the wiki renderer, which
* turns square brackets into links and (( )) into paragraphs - and the
* editor's markup and stylesheet use both. Here only the site's page
* template is rendered as usual; content.html, made by the editor's own
* deterministic renderer, is placed into it exactly as it is.
*/
var htmlContent = "";

var ContentPageBuilder = function(pageName) {

  if(pageName.charAt(0)!="/") pageName = "/"+pageName;

  var VERSION = "0.1.0";
  var contentBuilder = "/OpenForum/AddOn/ContentEditor/content-page-builder.js "+VERSION;
  var CONTENT_FILE = "content.html";
  var MARKER = "CONTENTEDITORPUBLISHEDCONTENTMARKER";
  var renderer = js.getObject("/OpenForum/Javascript/Renderer","DefaultRenderer.sjs");

  var escapeHtml = function(value) {
    return (""+value).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
  };

  // The same fields and &insert:...; handling as the default builder, for
  // the template only. Values from data.json are escaped, since a page
  // title is typed by an editor.
  var applyFields = function(timestamp, template) {
    var fields = {};
    fields["pageName"] = pageName;
    fields["title"] = openForum.wikiToTitleName(pageName);
    fields["shortTitle"] = openForum.wikiToTitleName(pageName);
    fields["author"] = "unknown";
    fields["lastChangedBy"] = "unknown";
    fields["referringPages"] = "";
    fields["attachments"] = "";
    fields["tags"] = "";
    try {
      var data = JSON.parse(""+file.getAttachment(pageName,"data.json"));
      for(var i in data) {
        if(typeof data[i]==="string") fields[i] = escapeHtml(data[i]);
      }
    } catch(e) {}
    fields["time"] = timestamp;

    var result = "";
    var searchData = template;
    var steps = 0;
    while(searchData.indexOf("&")!=-1 && steps<10000) {
      steps++;
      var start = searchData.indexOf("&");
      result += searchData.substring(0,start);
      searchData = searchData.substring(start+1);
      var end = searchData.indexOf(";");
      if(end==-1) {
        result += "&";
        break;
      }
      var fieldName = searchData.substring(0,end);
      if(fields.hasOwnProperty(fieldName)) {
        result += fields[fieldName];
        searchData = searchData.substring(end+1);
      } else if(fieldName.indexOf("insert:")===0) {
        var insertFile = fieldName.substring(7);
        if(insertFile.indexOf("/")!=0) insertFile = pageName+"/"+insertFile;
        var insertPageName = ""+insertFile.substring(0,insertFile.lastIndexOf("/"));
        var insertFileName = ""+insertFile.substring(insertFile.lastIndexOf("/")+1);
        searchData = searchData.substring(end+1);
        if(file.attachmentExists(insertFile,"page.html.fragment")) {
          searchData = "<!--OF insert ("+insertFile+") start -->"+file.getAttachment(insertFile,"page.html.fragment")+"<!--OF insert ("+insertFile+") end -->"+searchData;
        } else if(file.attachmentExists(insertPageName,insertFileName)) {
          searchData = "<!--OF insert ("+insertFile+") start -->"+file.getAttachment(insertPageName,insertFileName)+"<!--OF insert ("+insertFile+") end -->"+searchData;
        } else {
          searchData = "<!--OF insert not found ( page:"+insertPageName+" file:"+insertFileName+") -->"+searchData;
        }
      } else {
        result += "&";
      }
    }
    return renderer.render(pageName,result+searchData);
  };

  try{
    var content = file.attachmentExists(pageName,CONTENT_FILE)==true ? ""+file.getAttachment(pageName,CONTENT_FILE) :
      "<p>This page has not been published from the Content Editor yet.</p>";
    var timestamp = file.attachmentExists(pageName,CONTENT_FILE)==true ? file.getAttachmentTimestamp(pageName,CONTENT_FILE) : new Date().getTime();

    var template = file.getPageInheritedFileAsString(pageName,"page.html.template");
    template = template===null ? "&content;" : ""+template;
    var built = applyFields(timestamp, template.replace("&content;",MARKER));
    var note = "<!--Content built using "+contentBuilder+"-->";

    file.saveAttachment(pageName,"page.html.fragment",note+"\n"+content);
    htmlContent = built.replace(MARKER,"\n"+note+"\n"+content+"\n");
    file.saveAttachment(pageName,"page.html",htmlContent);
    log.info("Built "+pageName+" with "+contentBuilder);
  } catch(e) {
    var message = "Failed to build "+pageName+" using "+contentBuilder+". Exception "+e+" on line number "+e.lineNumber;
    log.error(message);
    htmlContent += "\n<!--"+message+"-->";
  }
};

new ContentPageBuilder(pageName);

htmlContent = ""+htmlContent;

