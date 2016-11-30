/*
* Author: Nik Cross
* Description: 
*
* MockFile = js.getObject("/OpenForum/Javascript/Tester","MockFile.sjs");
* mockFile = MockFile.getMock();
* mockFile.addMockFile( [pageName], [fileName],[content] );
*/
var MockFile = function() {
  var self = this;
  self.getMock = function() {
    return new function() {
      var self = this;

      self.getPageInheritedFileAsString = function(pageName,fileName) {
        return getFile(pageName,fileName);
      };

      self.getAttachmentsForPage = function(pageName) {
        return new function() {
          this.keySet = function() {
            return new function() {
              this.iterator = function() {
                return new function() {
                  var list=[];
                  for(var i in mockData) list.push( i.substring(i.lastIndexOf("/")+1) );
                  var index = 0;
                  
                  this.hasNext = function() {
                    return index<list.length;
                  }
                  this.next = function() {
                    return list[index++];
                  }
                }
              }
            }
          }
        }
      }

      self.attachmentExists= function(pageName,fileName) {  };

      self.getAttachment = function(pageName,fileName) {
        return getFile(pageName,fileName);
      };

      self.saveAttachment= function(pageName,fileName,data) {
        mockData[pageName+"/"+fileName] = data;
      };
      self.saveAttachmentNoBackup = self.saveAttachment;

      self.getAttachmentTimestamp= function(pageName,fileName) {
        return getFileAge(pageName,fileName);
      };    

      var mockData = [];
      var mockDataTS = [];
      self.addMockFile = function(pageName,fileName,data,age) {
        mockData[pageName+"/"+fileName] = data;
        if(!age) {
          age=0;
        }
        mockDataTS[pageName+"/"+fileName] = age;
      };

      var getFile = function(pageName,fileName) {
        return mockData[pageName+"/"+fileName];
      };
      var getFileAge = function(pageName,fileName) {
        return mockDataTS[pageName+"/"+fileName];
      };
    }
  }
}