/* Help script for file*/

var fileHelp= {};
fileHelp.deleteAttachmentNoBackup0={};
fileHelp.deleteAttachmentNoBackup0.notes="Delete a file attached to a page without backing it up in history";
fileHelp.deleteAttachmentNoBackup0.args=" {string pageName} , {string fileName} ";
fileHelp.deleteAttachmentNoBackup0.returns="{boolean success}";
// fileHelp.deleteAttachmentNoBackup0.url="";

fileHelp.appendToPageSource1={};
fileHelp.appendToPageSource1.notes="Append data to file";
fileHelp.appendToPageSource1.args=" {string pageName}, {string dataToAppend}";
// fileHelp.appendToPageSource1.url="";

fileHelp.getAttachmentTimestamp2={};
fileHelp.getAttachmentTimestamp2.notes="Get the time since a file's last modification";
fileHelp.getAttachmentTimestamp2.args=" {string pageName} , {string fileName} ";
fileHelp.getAttachmentTimestamp2.returns="{integer timeSinceLastModification}";
// fileHelp.getAttachmentTimestamp2.url="";

fileHelp.getAttachment3={};
// fileHelp.getAttachment3.notes="";
fileHelp.getAttachment3.args=" {string pageName} , {string fileName} , {boolean resolveLinks} ";
// fileHelp.getAttachment3.returns="string";
// fileHelp.getAttachment3.url="";

fileHelp.getAttachment4={};
// fileHelp.getAttachment4.notes="";
fileHelp.getAttachment4.args=" {string pageName} , {string fileName} ";
// fileHelp.getAttachment4.returns="string";
// fileHelp.getAttachment4.url="";

fileHelp.pageExists5={};
// fileHelp.pageExists5.notes="";
fileHelp.pageExists5.args=" {string pageName} ";
// fileHelp.pageExists5.returns="boolean";
// fileHelp.pageExists5.url="";

fileHelp.getPageInheritedFileAsString6={};
// fileHelp.getPageInheritedFileAsString6.notes="";
fileHelp.getPageInheritedFileAsString6.args=" {string pageName} , {string fileName} ";
// fileHelp.getPageInheritedFileAsString6.returns="string";
// fileHelp.getPageInheritedFileAsString6.url="";

fileHelp.appendStringToFile7={};
// fileHelp.appendStringToFile7.notes="";
fileHelp.appendStringToFile7.args=" {string pageName} , {string fileName} , {string dataToAppend} ";
// fileHelp.appendStringToFile7.url="";

fileHelp.copyAttachment8={};
// fileHelp.copyAttachment8.notes="";
fileHelp.copyAttachment8.args=" {string fromPageName} , {string fromFileName} , {string toPageName} , {string toFileName} ";
// fileHelp.copyAttachment8.url="";

fileHelp.attachmentExists9={};
// fileHelp.attachmentExists9.notes="";
fileHelp.attachmentExists9.args=" {string pageName} , {string fileName} ";
// fileHelp.attachmentExists9.returns="boolean";
// fileHelp.attachmentExists9.url="";

fileHelp.getAttachmentSize10={};
// fileHelp.getAttachmentSize10.notes="";
fileHelp.getAttachmentSize10.args=" {string pageName} , {string fileName} ";
// fileHelp.getAttachmentSize10.returns="integer";
// fileHelp.getAttachmentSize10.url="";

fileHelp.getAttachmentInputStream11={};
// fileHelp.getAttachmentInputStream11.notes="";
fileHelp.getAttachmentInputStream11.args=" {string pageName} , {string fileName} ";
// fileHelp.getAttachmentInputStream11.returns=">>>java.io.InputStream<<<";
// fileHelp.getAttachmentInputStream11.url="";

fileHelp.getPageInheritedFilePath12={};
// fileHelp.getPageInheritedFilePath12.notes="";
fileHelp.getPageInheritedFilePath12.args=" {string pageName} , {string fileName} ";
// fileHelp.getPageInheritedFilePath12.returns="string";
// fileHelp.getPageInheritedFilePath12.url="";

fileHelp.zipPage13={};
// fileHelp.zipPage13.notes="";
fileHelp.zipPage13.args=" {string pageName} ";
// fileHelp.zipPage13.url="";

fileHelp.getAttachmentOutputStream14={};
// fileHelp.getAttachmentOutputStream14.notes="";
fileHelp.getAttachmentOutputStream14.args=" {string pageName} , {string fileName} ";
// fileHelp.getAttachmentOutputStream14.returns=">>>java.io.OutputStream<<<";
// fileHelp.getAttachmentOutputStream14.url="";

fileHelp.saveAttachment15={};
// fileHelp.saveAttachment15.notes="";
fileHelp.saveAttachment15.args=" {string pageName} , {string fileName} , {string data} ";
// fileHelp.saveAttachment15.url="";

fileHelp.saveAttachmentNoBackup16={};
// fileHelp.saveAttachmentNoBackup16.notes="";
fileHelp.saveAttachmentNoBackup16.args=" {string pageName} , {string fileName} , {string dataToAppend} ";
// fileHelp.saveAttachmentNoBackup16.url="";

fileHelp.unZipAttachment17={};
// fileHelp.unZipAttachment17.notes="";
fileHelp.unZipAttachment17.args=" {string pageName} , {string fileName} ";
// fileHelp.unZipAttachment17.url="";

fileHelp.appendStringToFileNoBackup18={};
// fileHelp.appendStringToFileNoBackup18.notes="";
fileHelp.appendStringToFileNoBackup18.args=" {string pageName} , {string fileName} , {string dataToAppend} ";
// fileHelp.appendStringToFileNoBackup18.url="";

fileHelp.getAttachmentsForPage19={};
// fileHelp.getAttachmentsForPage19.notes="";
fileHelp.getAttachmentsForPage19.args=" {string pageName} ";
// fileHelp.getAttachmentsForPage19.returns="Map";
// fileHelp.getAttachmentsForPage19.url="";
result = fileHelp;
