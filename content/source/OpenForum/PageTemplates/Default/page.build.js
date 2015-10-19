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

if(typeof(content)==="undefined") {
	errors += "<li>No content supplied by caller</li>";
	content = file.getAttachment(pageName,"page.content");
  if(content===null) {
	errors += "<li>No content found at "+pageName+"/page.content</li>";
        content = file.getAttachment(pageName,"page.wiki"); // deprecated
	if(content===null) {
		errors += "<li>No content found at "+pageName+"/page.wiki (deprecated)</li>";
	}
  }
} else {
  savePage = false;
  content = ""+content;
}

var htmlContent = "";
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

htmlContent = htmlContent + "<!--Content built using "+contentBuilder+"-->";

if(savePage===true) file.saveAttachment(pageName,"page.html.fragment",openForum.renderWikiData(pageName,htmlContent));

htmlContent = pageTemplate.replace("&content;",htmlContent);

var fields = [];
fields["pageName"] = pageName;
fields["title"] = openForum.wikiToTitleName(pageName);
fields["author"] = "unknown";
fields["lastChangedBy"] = "unknown";
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
htmlContent = openForum.renderWikiData(pageName,htmlContent);
//openForum.postMessageToQueue("test","Saving Page:(" +pageName+ ") File:(page.html)");

if(savePage===true) file.saveAttachment(pageName,"page.html",htmlContent);

htmlContent = ""+htmlContent;
