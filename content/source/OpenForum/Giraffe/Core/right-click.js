Giraffe.addRightClick = function(canvas) {
  canvas.addEventListener('contextmenu', function(ev) {
    ev.preventDefault();
    //alert('success!');
    return false;
  }, false);
};