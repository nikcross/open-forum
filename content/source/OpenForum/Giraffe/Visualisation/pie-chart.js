/*
* Author: 
* Description: 
*/
function PieChart(data, options) {
  var self = this;
  
  var defaultOptions = {
    x: 0,
    y: 0,
    width: 400,
    height: 400,
    fillColor: "cyan",
    color: "blue",
    font: "Arial",
    margin: {top: 20, bottom: 20, right: 100, left: 100},
    fontSize: 10
  };
  
  //Override default options where given
  //Move this to OpenForum new JSO class
  for(var i in options) {
    if( typeof(defaultOptions[i])!=="undefined" ) {
      defaultOptions[i] = options[i];
    }
  }
  options = defaultOptions;
  
  var view;
  var color = [ "red", "green", "blue", "cyan", "white", "black" ];
  
  self.init = function() {
    view = new Composite(options.x,options.y,0);
    
    var center = { x: options.x + options.width/2, y: options.y + options.height/2 };
    var radius = options.width/2;
    
    view.add( new Circle( center.x, center.y, radius ).setColor(options.color).setFillColor(options.fillColor) );
    
    var total = 0;
    for(var i=0;i<data.length;i++) {
      total += data[i];
    }
    
    var offset = -90;
    for(var i=0;i<data.length;i++) {
      var deg = ((data[i]*360)/total);
      view.add( new Arc( center.x, center.y, offset, deg, radius )
               .setColor(options.color).setFillColor(color[i])
               .setLineStyle( new Giraffe.LineStyle() )
              );
      offset += deg;
    }
  };
    
  self.getView = function() {
    return view;
  };

  self.init();
}