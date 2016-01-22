var tester = js.getObject("/OpenForum/Javascript/Tester","Test.sjs");
tester.log("Running tests in /OpenForum/Javascript/PageBuilder/default-page-builder.sjs");

var script = file.getAttachment("/OpenForum/Javascript/PageBuilder","default-page-builder.js");
var renderer = eval( "function(content,pageName,file,log){ "+script+"; return 'Content: '+htmlContent;}" );

var mockLog = function() {
  var self = this;
  var errorMessage = "No errors logged";
  var infoMessage = "No info logged";
  self.error = function(message) {
    errorMessage = message;
  };
  
  self.getErrorMessage = function() {
    return errorMessage;
  };
  
  self.info = function(message) {
    infoMessage = message;
  };
  
  self.getInfoMessage = function() {
    return infoMessage;
  };
};
mockLog = new mockLog();

var mockFile = function() {
  var self = this;
  self.getPageInheritedFileAsString = function(pageName,fileName) {
    if(fileName==="page.html.template") {
      return "<!-- Page Content -->" + "&content;" + "<!-- End of Page Content -->";
    } else if(fileName==="page.content") {
      return "Dummy Page Content";
    }
  };
  self.attachmentExists= function(pageName,fileName) {  };
  self.getAttachment = function(pageName,fileName) {  };
  self.saveAttachment= function(pageName,fileName,data) {  };
  self.getAttachmentTimestamp= function(pageName,fileName) {  };
};
mockFile = new mockFile();

buildPage = function(content) {
  return renderer(content,"/OpenForum/Javascript/PageBuilder",mockFile,mockLog);
};

tester.unitTest("Content rendered in template.").
												given("The Content").
												when(buildPage).
												thenOutputContains("The Content").
													run();

tester.unitTest("Wiki content rendered in template.").
												given("* One Item").
												when(buildPage).
												thenOutputContains("<li> One Item</li>").
													run();

var results = tester.getResults();
tester.log("Completed tests in /OpenForum/Javascript/PageBuilder/default-page-builder.sjs Tests:"+results.tests+" Passed:"+results.passed+" Failed:"+results.failed);
