var pageTemplate = ""+file.getPageInheritedFileAsString(pageName,"page.html.template");
if( pageTemplate==null ) {
	// Get header content
	var headerTemplate = ""+file.getPageInheritedFileAsString(pageName,"header.html.template");
	// Get footer content
	var footerTemplate = ""+file.getPageInheritedFileAsString(pageName,"footer.html.template");

	pageTemplate = headerTemplate + "<!-- Page Content -->" + "&content;" + "<!-- End of Page Content -->" + footerTemplate;
	// Insert inserts
}

if(content==null) {
	var content = file.getAttachment(pageName,"page.content");
  if(content==null) {
    content = file.getAttachment(pageName,"page.wiki"); // deprecated
  }
}
var htmlContent = openForum.renderWikiData(pageName,""+content);

file.saveAttachment(pageName,"page.html.fragment",htmlContent);

htmlContent = pageTemplate.replace("&content;",htmlContent);

var fields = [];
fields["pageName"] = pageName;
fields["title"] = openForum.wikiToTitleName(pageName);
fields["author"] = "unknown";
fields["referringPages"] = "";
fields["attachments"] = "";
fields["tags"] = "";
fields["time"] = openForum.getTimeStamp();

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

//openForum.postMessageToQueue("test","Saving Page:(" +pageName+ ") File:(page.html)");

file.saveAttachment(pageName,"page.html",htmlContent);

htmlContent = htmlContent;
