/*
* Author: 
*/
OpenForum.includeScript("/OpenForum/Giraffe/giraffe.js");
OpenForum.includeScript("/TheLab/Giraffe/TimesTablesTester/number-pad.js");
OpenForum.includeScript("/TheLab/Giraffe/TimesTablesTester/start-message.js");
OpenForum.includeScript("/TheLab/Giraffe/TimesTablesTester/stop-watch.js");
OpenForum.includeScript("/TheLab/Giraffe/TimesTablesTester/table-selector.js");
OpenForum.includeScript("/TheLab/Giraffe/TimesTablesTester/times-tables-tester.js");

var canvas;

OpenForum.init = function() {
  canvas = new Canvas("canvas");
  Giraffe.Interactive.setInteractive(canvas);
  Giraffe.setAnimated(canvas);
  canvas.startAnimation(20,100,true);

  startTimesTablesTester();
};
