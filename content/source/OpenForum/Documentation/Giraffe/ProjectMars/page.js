/*
* Author: 
*/
OpenForum.includeScript("/OpenForum/Giraffe/giraffe.js");
OpenForum.includeScript("/TheLab/Giraffe/ProjectMars/mars.js");
OpenForum.includeScript("/TheLab/Giraffe/ProjectMars/robot.js");

OpenForum.init = function() {
  //foldFunc = CodeMirror.newFoldFunction(CodeMirror.braceRangeFinder);
  /*codeMirror = CodeMirror.fromTextArea(
    document.getElementById("code"),
    { 
      theme: 'rubyblue',
      lineNumbers: true,
      matchBrackets: true,
      onGutterClick: foldFunc
    }
  );*/

  canvas = new Canvas("canvas");
  Giraffe.setAnimated(canvas);
  canvas.startAnimation(20,100,true);

  createMars(canvas);
  robot = new Robot(2,2);
  mars.add( robot );

  print("Project Mars is ready");

};

function run() {
  if(robot.running==true) {
    print("Robot currently running program. Please Wait.");
    return;
  }

  robot.clearProgram();
  try{
    //eval( codeMirror.getValue());
    eval( document.getElementById("code").value );
  } catch (e) {
    print(e);
    return;
  }
  print("Program Loaded");
  robot.run();
}

function print(message) {
  document.getElementById("console").innerHTML="<b>"+message+"</b><br/>"+document.getElementById("console").innerHTML;
}
function clearConsole() {
  document.getElementById("console").innerHTML="";
  return false;
}
