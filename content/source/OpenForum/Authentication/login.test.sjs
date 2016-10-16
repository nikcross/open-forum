/*
* Author: 
* Description: 
*/

var tester = js.getObject("/OpenForum/Javascript/Tester","Test.sjs");
tester.log("Running tests in /OpenForum/Authentication/login.sjs");

var script = file.getAttachment("/OpenForum/Authentication","login.sjs");
var loginSJS = eval( "function(file,login){ "+script+"; return result;}" );

var MockLogin = function(userName,password) {
  var self = this;
  self.getUser = function() {
    return {
      getName: function() { return userName;}
    };
  };
  self.getPassword = function() { return password;};
  self.clearPassword = function() {};
};

var mockFile = function() {
  var self = this;
  self.getPageInheritedFileAsString = function(pageName,fileName) {
    return getFile(pageName,fileName);
  };
  self.attachmentExists= function(pageName,fileName) {  };
  self.getAttachment = function(pageName,fileName) {
    return getFile(pageName,fileName);
  };
  self.saveAttachment= function(pageName,fileName,data) {  };
  self.getAttachmentTimestamp= function(pageName,fileName) {
    return getFile(pageName,fileName);
  };
  
  var mockData = [];
  self.clear = function() {
    mockData = [];
  };
  
  self.addMockFile = function(pageName,fileName,data) {
    mockData[pageName+"/"+fileName] = data;
  };
  
  var getFile = function(pageName,fileName) {
    return mockData[pageName+"/"+fileName];
  };
};
mockFile = new mockFile();

tryLogin = function( data ) {
  mockFile.clear();
  mockFile.addMockFile( "/OpenForum/Users/"+data.userName,"password.txt", data.password );
  mockFile.addMockFile( "/OpenForum/Authentication","authentication.hash.a",data.hashA );
  mockFile.addMockFile( "/OpenForum/Authentication","authentication.hash.b",data.hashB );
  var login = new MockLogin( data.userName,data.hashedPassword );
  
  return loginSJS( mockFile,login );
};

tester.unitTest("User can login.").
given( {userName: "name", password: "password", hashedPassword: "3438866277a7269987d6c6f7373e1070", hashA: "hashA", hashB: "hashB"} ).
when(tryLogin).
then(true).
run();

tester.unitTest("User can login with old hash.").
given( {userName: "name", password: "password", hashedPassword: "54f6466cd5cf823a91890d37dc841522", hashA: "hashA", hashB: "hashB"} ).
when(tryLogin).
then(true).
run();

tester.unitTest("User can't login with wrong password.").
given( {userName: "name", password: "password", hashedPassword: "fffff66cd5cf823a91890d37dc841522", hashA: "hashA", hashB: "hashB"} ).
when(tryLogin).
then(false).
run();