var screenWidth;
var screenHeight;
OpenForum.init = function() {
  var canvas = document.getElementById("mapCanvas");
  
  var w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0];
  
  screenWidth = w.innerWidth || e.clientWidth || g.clientWidth,
  screenHeight = w.innerHeight|| e.clientHeight|| g.clientHeight;
  
  canvas.width=screenWidth;
  canvas.height=screenHeight;
  
  initMap();
};