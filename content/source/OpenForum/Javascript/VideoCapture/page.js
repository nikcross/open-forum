OpenForum.includeScript("/OpenForum/Javascript/VideoCapture/VideoCapture.js");

OpenForum.init = function() {
  document.getElementById("testFrame").innerHTML = "<canvas id=\"canvas\"></canvas>";
	frameCatcher = new OpenForum.VideoCapture("canvas");
};