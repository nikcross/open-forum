OpenForum.includeScript("/OpenForum/Javascript/VideoCapture/VideoCapture.js");

OpenForum.init = function() {
	frameCatcher = new OpenForum.VideoCapture("canvas",{width: 800, height: 400});
};