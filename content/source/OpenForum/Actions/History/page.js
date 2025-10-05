OpenForum.includeScript("/OpenForum/Actions/History/HistoryClient.js");

var pageName = "/OpenForum/Actions/History";
var fileTables="";

OpenForum.init = function() {
  if(OpenForum.getParameter("pageName")) {
    pageName = OpenForum.getParameter("pageName");
  }
  getHistory(pageName);
};

function getHistory(pageName) {
  JSON.get("/OpenForum/Actions/History","list","pageName="+pageName).onSuccess(displayHistory).go();
}

function displayHistory(result) {
  result = result.data;
  fileTables="<ul>";
  for(var i=0; i<result.length; i++) {
    var file = result[i];
    fileTables+="<li>";
    fileTables+=file.file;

    fileTables+="<ul>";
    for(var j=0; j<file.history.length; j++) {
      var version = file.history[j];
      fileTables+="<li><a href=\"/TheLab/MergeEditor?file1=/"+pageName+"/"+file.file+"&file2=/"+pageName+"/history/"+version.file+"\">"+version.time+"</a></li>";
      //fileTables+="<li><a href=\"/OpenForum/Editor?pageName="+pageName+"/history&fileName="+version.file+"\" target=\"_editor\">"+version.time+"</a></li>";
    }
    fileTables+="</ul>";
    fileTables+="</li>";
  }
  fileTables+="</ul>";
}
