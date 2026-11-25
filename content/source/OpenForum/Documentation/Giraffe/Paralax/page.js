/*

* Author: 
*/
OpenForum.includeScript("/OpenForum/Giraffe/giraffe.js");

OpenForum.init = function() {
  canvas = new Canvas("canvas");
  Giraffe.Interactive.setInteractive(canvas);
  Giraffe.setAnimated(canvas);
  canvas.startAnimation(15,100,true);

  drawLayers();
};
function drawLayers() {

  background = new Picture(0,0,"/TheLab/Giraffe/Paralax/background2.png");

  middleground = new Composite(0,0);
  middleground.add(new Picture(0,0,"/TheLab/Giraffe/Paralax/middleground.png"));
  middleground.add(new Picture(800,0,"/TheLab/Giraffe/Paralax/middleground.png"));

  foreground = new Composite(0,0);
  foreground.add(new Picture(0,0,"/TheLab/Giraffe/Paralax/foreground.png"));
  foreground.add(new Picture(800,0,"/TheLab/Giraffe/Paralax/foreground.png"));

  canvas.add(background);
  canvas.add(middleground);
  canvas.add(foreground);

  foreground.sequence=new Giraffe.MoveSequence(foreground,200,[-2,0]);
  foreground.sequence.doNext = function() {
    foreground.sequence.start();
  };
  foreground.sequence.start();

  middleground.sequence=new Giraffe.MoveSequence(middleground,200,[-1,0]);
  middleground.sequence.doNext = function() {
    middleground.sequence.start();
  };
  middleground.sequence.start();
}