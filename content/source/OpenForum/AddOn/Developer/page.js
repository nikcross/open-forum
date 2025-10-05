/*
* Author: 
*/

developerFiles=[];
developerFiles_rowTemplate = {"storePage":"","targetPage":"","fileName":""};
OpenForum.init = function() {
  OpenForum.loadJSON("/OpenForum/AddOn/Developer/developer-files.json",function(json){ developerFiles=json; });
};
