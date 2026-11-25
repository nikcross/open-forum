//Version 1.0.26
function Graph(data,options) {
  var self = this;
  var graph;

  //Find min and max of data set
  var maxValue;
  var minValue;
  for(var i=0;i<data.length;i++) {
    if(!maxValue || data[i]>maxValue) {
      maxValue = data[i];
    }
    if(!minValue || data[i]<minValue) {
      minValue = data[i];
    }
  }

  //Calculate default graph range
  var ymin = Math.floor(minValue/100)*100;
  var ymax = Math.ceil(maxValue/100)*100;
  var ysteps = Math.ceil( (maxValue-minValue)/100 )+1;

  var defaultOptions = {
    x: 0,
    y: 0,
    width: 400,
    height: 400,
    fillColor: "cyan",
    color: "blue",
    font: "Arial",
    margin: {top: 30, bottom: 20, right: 20, left: 20},
    fontSize: 10,
    tickSize: 6,
    style: "line", //line, sparkline or area

    showPoints: false,
    showVertices: true,
    vertices: { color: "black" },

    xLabels: true,
    yLabels: true,

    labels: { color: "black" },

    xAxis: {min: 0, max: data.length, steps: data.length},
    yAxis: {min: ymin, max: ymax, steps: ysteps},

    shoutOut: function(x,show) {}
  };

  //Set special defaults for sparklines
  if(options && options.style && options.style==="sparkline") {
    defaultOptions.margin = {top: 5, bottom: 5, right: 5, left: 5};
    defaultOptions.showPoints = false;
    defaultOptions.showVertices = false;
  }

  //Override default options where given
  //Move this to OpenForum new JSO class
  for(var i in options) {
    if( typeof(defaultOptions[i])!=="undefined" ) {
      defaultOptions[i] = options[i];
    }
  }
  options = defaultOptions;

  var view;

  self.init = function() {
    view = new Composite(options.x,options.y,0);

    // Calculate plot area
    var width = (options.width-(options.margin.left+options.margin.right));
    var height = (options.height-(options.margin.top+options.margin.bottom));

    if(options.showVertices) {

      var vertices = new Composite(options.margin.left,options.margin.top);
      view.add( vertices );

      //Show x axis
      vertices.add( new Line(0,height,width,0).setColor( options.vertices.color ) );
      var spanX = options.xAxis.max - options.xAxis.min;
      var stepX = spanX / (options.xAxis.steps);
      for(var x=0;x<options.xAxis.steps;x++) {
        var labelText = ""+ (options.xAxis.min + (stepX*x));
        if(options.xLabels) {
          if(isArray(options.xLabels)) labelText = options.xLabels[x];
          vertices.add( new Text((width*x/(options.xAxis.steps-1))-(options.fontSize/2),height+options.tickSize+options.fontSize,labelText,options.fontSize,options.font).setColor( options.labels.color ).setFillColor( options.labels.color ) );
        }
        vertices.add( new Line((width*x/(options.xAxis.steps-1)),height,0,options.tickSize).setColor( options.vertices.color ) );
      }

      //Show y axis
      vertices.add( new Line(0,0,0,height).setColor( options.vertices.color ) );
      var spanY = options.yAxis.max - options.yAxis.min;
      var stepY = spanY / options.yAxis.steps;
      for(var y=0;y<=options.yAxis.steps;y++) {
        var labelText = ""+ (options.yAxis.min + (stepY*y));
        if(options.yLabels) {
          if(isArray(options.yLabels)) labelText = options.yLabels[y];
          vertices.add( new Text(-(options.tickSize+(options.fontSize*3)),height-(height*y/options.yAxis.steps)+(options.fontSize/2),labelText,options.fontSize,options.font).setColor( options.labels.color ).setFillColor( options.labels.color ) );
        }
        vertices.add( new Line(0,height-(height*y/options.yAxis.steps),-options.tickSize,0).setColor( options.vertices.color ) );
      }
    }

    graph = new Composite(options.margin.left,options.margin.top);
    view.add( graph );

    self.addDataSet(data);
  };

  self.addDataSet = function( data,colours ) {
    if(!colours) {
      colours = { color: options.color, fillColor: options.fillColor};
    }

    var width = (options.width-(options.margin.left+options.margin.right));
    var height = (options.height-(options.margin.top+options.margin.bottom));

    var polygon = new Polygon( 0,height ).setColor(colours.color);
    polygon.lineStyle = new LineStyle();
    polygon.lineStyle.thickness = 3;
    if(options.style==="line" || options.style==="sparkline") {
      polygon.closed = false;
      if(options.style==="sparkline") {
        polygon.smooth = true;
      }
    }

    graph.add(polygon);
    for(var x=0; x<options.xAxis.steps;x++) {

      var value = (data[x]-options.yAxis.min)/(options.yAxis.max-options.yAxis.min);

      polygon.addPoint( x*(width/(options.xAxis.steps-1)),-value*height);

      if(options.showPoints) {
        var point = new Circle((x*(width/(options.xAxis.steps-1))),height-(value*height),5).setColor(colours.color).setFillColor(colours.fillColor);
        point.onMouseOver = function(p,i) {
          return function() {
            p.setFillColor(colours.color);
            if(options.shoutOut) options.shoutOut(i,true);
          };
        }(point,x);
        point.onMouseOut = function(p,i) {
          return function() {
            p.setFillColor(colours.fillColor);
            if(options.shoutOut) options.shoutOut(i,false);
          };
        }(point,x);
        graph.add( point );
      }
    }

    if(options.style==="area") {
      polygon.addPoint( (x-1)*(width/(options.xAxis.steps-1)),0);
      polygon.addPoint( 0,0);
      polygon.setFillColor(colours.fillColor);
    }
  };

  self.getView = function() {
    return view;
  };

  self.init();
}