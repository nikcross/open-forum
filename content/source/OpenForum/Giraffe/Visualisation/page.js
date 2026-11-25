/*
* Author: 
*/
OpenForum.loadScript("/OpenForum/Giraffe/giraffe.js");
OpenForum.loadScript("/OpenForum/Giraffe/Visualisation/dial.js");
OpenForum.loadScript("/OpenForum/Giraffe/Visualisation/graph.js");
OpenForum.loadScript("/OpenForum/Giraffe/Visualisation/pie-chart.js");

OpenForum.init = function() {
  showGraph();
  showDial();
  showPieChart();
};

function showPieChart() {
  var giraffe = { canvas: null };
  
  giraffe.canvas = new Canvas("pieChartCanvas");
  Giraffe.setAnimated(giraffe.canvas);
  giraffe.canvas.startAnimation(15,1000,true);
  
  var data = [10,15,25,17,12,5];
  
  var options = {
    x: 0,
    y: 0,
    width: 400,
    height: 400,
    fillColor: new GradientColor(giraffe.canvas,"rgba(150,200,50,255)","rgba(50,150,50,255)",0,0,0,-25).getColor(),
    color: "green",
    font: "Arial",
    margin: {top: 20, bottom: 20, right: 100, left: 100},
    fontSize: 10
  };
  
  var pieChart = new PieChart(data,options);
  pieChart.init();  
  giraffe.canvas.add( pieChart.getView() );
}

function showGraph() {
  var giraffe = { canvas: null };
  
  giraffe.canvas = new Canvas("giraffeChartCanvas");
  Giraffe.setAnimated(giraffe.canvas);
  giraffe.canvas.startAnimation(15,1000,true);
  
  var data = [10,15,25,17,12,5];
  var options = {
    x: 0,
    y: 0,
    width: 400,
    height: 400,
    fillColor: new GradientColor(giraffe.canvas,"rgba(150,200,50,255)","rgba(50,150,50,255)",0,0,0,-25).getColor(),
    color: "green",
    font: "Arial",
    margin: {top: 20, bottom: 20, right: 100, left: 100},
    fontSize: 10,
    tickSize: 6,
    style: "area", //line, sparkline or area

    showPoints: true,
    showVertices: true

    //xAxis: {min: 0, max: data.length, steps: data.length},
    //yAxis: {min: ymin, max: ymax, steps: ysteps}
  };
  
  var graph = new Graph(data,options);
  graph.init();  
  giraffe.canvas.add( graph.getView() );
}

function showDial() {
  var giraffe = { canvas1: null, cavas2: null };
  
  var dial = new Dial(0,0).setTitle("Dial 1").setDemoMode(true);

  giraffe.canvas1 = new Canvas("giraffeDialCanvas");
  Giraffe.setAnimated(giraffe.canvas1);
  giraffe.canvas1.startAnimation(15,1000,true);
  
  dial.build(giraffe.canvas1);
  
  var greenDial = new Dial(0,0,{colors:{ text:"rgb(0,255,0)" }}).setTitle("Dial 2").setDemoMode(true);
  
  giraffe.canvas2 = new Canvas("greenDialCanvas");
  Giraffe.setAnimated(giraffe.canvas2);
  giraffe.canvas2.startAnimation(15,1000,true);
  
  greenDial.build(giraffe.canvas2);
}
