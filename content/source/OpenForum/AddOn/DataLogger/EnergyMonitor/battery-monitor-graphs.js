/*
* Author:
*/
var BatteryMonitorGraphs = function(deviceId,viewMonth,graphElementId,voltageFactor,graphMax,dischargedVoltage,chargedVoltage,callStart,callEnd) {
  var self = this;
  
  if(!graphMax) graphMax = 100;
  if(!voltageFactor) voltageFactor = 1;
  
  var init = function() {
    if(callStart) callStart();
    // to move to giraffe
    var g = document.getElementById(graphElementId);
    var width = g.style.width;
    if(width.indexOf("px")) width = width.substring(0,width.indexOf("px"));
    g.width = width;

    var height = g.style.height;
    if(height.indexOf("px")) height = height.substring(0,height.indexOf("px"));
    g.height = height;

    canvas = new Canvas(graphElementId);  

    var now = new Date();
    viewMonth = now.getMonth();
    getMonthView( viewMonth );
  };

  DependencyService
    .createNewDependency()
    .addDependency("/OpenForum/Giraffe/giraffe.js")
    .addDependency("/OpenForum/Giraffe/Visualisation/graph.js")
    .setOnLoadTrigger( init )
    .loadDependencies();

  var getMonthView = function(month) {
    canvas.graphicsObjects = [];

    var startDate = new Date();
    startDate.setMonth(month);
    startDate.setDate(1);
    startDate.setHours(0);
    startDate.setMinutes(0);
    startDate.setSeconds(0);

    var endDate = new Date( startDate.getTime());
    var lastDay = 0;
    while( endDate.getMonth() == startDate.getMonth()) {
      lastDay = endDate.getDate();
      endDate.setDate( lastDay+1 );
    }

    var startTime = startDate.getTime();
    var endTime = endDate.getTime();

    JSON.get("/OpenForum/AddOn/DataLogger","getData","groupBy=hour&serviceId=energyMonitor&deviceId="+deviceId+"&key=bat&startTime="+startTime+"&endTime="+endTime).onSuccess(
      function (voltageResp) { displayMonthData(startDate,voltageResp.data); }
    ).go();

  };

  var getDaysData = function(date,data) {
    var start = new Date();
    start.setTime(date.getTime());
    start.setHours(0);
    start.setMinutes(0);
    start.setSeconds(0);

    var startTime = start.getTime();

    var end = new Date();
    end.setTime(start.getTime());
    end.setDate( end.getDate()+1 );

    var endTime = end.getTime();

    var match = [];

    for(var i=0;i<data.length;i++) {
      var time = parseInt(data[i].time);
      if(time>=startTime && time<=endTime) match.push( data[i] );
    }

    return match;
  };

  var displayMonthData = function(startDate,voltage) {
    var today = new Date();
    var startTS = startDate.getTime();
    var startMonth = startDate.getMonth();
    var dayOffset = startDate.getDay();

    //Move days and months to OpenForum
    var months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    var monthName = months[startMonth];

    canvas.add( new Text(0,20,monthName+" "+startDate.getFullYear(),25,"cartogothic_stdregular").setFillColor("black") );
    var days = ["Sat","Sun","Mon","Tue","Wed","Thur","Fri"];
    for(var i=0;i<7;i++) {
      canvas.add( new Text(10+(i*100),45,days[i],18,"Arial").setFillColor("black") );
    }

    while( startDate.getMonth()==startMonth ) {

      var dayNo = startDate.getDate();
      if(dayNo<10) dayNo = "0"+dayNo;
      var monthNo = startDate.getMonth()+1;
      if(monthNo<10) monthNo = "0"+monthNo;
      var yearNo = startDate.getFullYear();

      //var datePageName = rootPageNameA+"/"+yearNo+"/"+monthNo;
      //var dateFileName = fileNameA+"-"+yearNo+"-"+monthNo+"-"+dayNo+".tsv";

      var calDayNo = startDate.getDate() + dayOffset;
      var x = ( calDayNo % 7)*100;
      var y = (Math.floor( calDayNo/7 )*100)+50;

      var isToday = false;
      if(today.getFullYear() == startDate.getFullYear() &&
         today.getMonth() == startDate.getMonth() &&
         today.getDate() == startDate.getDate()
        ) {
        isToday = true;
      }

      var daysData = getDaysData( startDate,voltage );
      if(daysData.length>0) {
        if(isToday) {
          canvas.add( new Rectangle(x,y,100,100).setFillColor("rgba(255,255,255,1)") );
          canvas.add( new Text(x+20,y+20,startDate.getDate()+"/"+(startDate.getMonth()+1),15,"cartogothic_stdregular").setColor("black").setFillColor("white") );
        } else {
          canvas.add( new Rectangle(x,y,100,100).setFillColor("rgba(100,100,100,1)") );
          canvas.add( new Text(x+20,y+20,startDate.getDate()+"/"+(startDate.getMonth()+1),15,"cartogothic_stdregular").setColor("white").setFillColor("white") );
        }
        addGraph(x,y,daysData,voltageFactor,"rgba(0,0,255,0.5)",20);
      } else {
        if(isToday) {
          canvas.add( new Rectangle(x,y,100,100).setFillColor("rgba(255,255,255,1)") );
          canvas.add( new Text(x+20,y+20,startDate.getDate()+"/"+(startDate.getMonth()+1),15,"cartogothic_stdregular").setColor("black").setFillColor("white") );
        } else {
          canvas.add( new Rectangle(x,y,100,100).setFillColor("rgba(20,20,20,1)") );
          canvas.add( new Text(x+20,y+20,startDate.getDate()+"/"+(startDate.getMonth()+1),15,"cartogothic_stdregular").setColor("white").setFillColor("white") );
        }
      }

      startDate.setDate( startDate.getDate()+1 );
    }


    startDate = new Date(startTS);
    startDate.setDate(1);

    while( startDate.getMonth()==startMonth ) {

      var dayNo = startDate.getDate();
      if(dayNo<10) dayNo = "0"+dayNo;
      var monthNo = startDate.getMonth()+1;
      if(monthNo<10) monthNo = "0"+monthNo;
      var yearNo = startDate.getFullYear();

      //var datePageName = rootPageNameB+"/"+yearNo+"/"+monthNo;
      //var dateFileName = fileNameB+"-"+yearNo+"-"+monthNo+"-"+dayNo+".tsv";

      var calDayNo = startDate.getDate() + dayOffset;
      var x = ( calDayNo % 7)*100;
      var y = (Math.floor( calDayNo/7 )*100)+50;

      var daysData = getDaysData( startDate,voltage );
      if(daysData.length>0) {
        addGraph(x,y,daysData,voltageFactor,"rgba(0,255,0,0.5)",40);
      }

      startDate.setDate( startDate.getDate()+1 );
    }

    canvas.repaint();
    
    if(callEnd) callEnd();
  };

  var addGraph = function(x,y,daysData,voltageFactor,color,textOffsetY) {

    var hourData = getHourlyData(daysData,voltageFactor);
    var totalGeneration = 0;

    canvas.add( new Graph(hourData,{
      style: "sparkline",
      width: 100, height: 100,
      font: "cartogothic_stdregular",
      color: color,
      x: x, y: y, 
      yAxis: {min: 0, max: graphMax, steps: 10},
      margin: {top: 5, bottom: 5, right: 5, left: 5}
    }).getView() );
  };

  var getHourlyData = function(data,voltageFactor) {
    //Hourly data in Wh
    
    var hourData = [];
    var hourCount = [];
    for(var hour = 0;hour<24;hour++) {
      hourData[hour]=0;
      hourCount[hour]=0;
    }

    for(var i=0;i<data.length;i++) {
      var date = new Date();
      date.setTime(data[i].time);
      if(data[i].readings == 0) continue;
      var voltage = parseFloat( data[i].value / data[i].readings );
      voltage = (voltage * voltageFactor); //Voltage

      hourData[date.getHours()] += voltage;
      hourCount[date.getHours()] ++;
    }
    //Calculate means
    for(var h in hourData) {
      if(hourCount[h] == 0) {
        hourData[h] = 0;
      } else {
      	hourData[h] = hourData[h] / hourCount[h];
        
        //Convert to charge %
        hourData[h] = (hourData[h] - dischargedVoltage) * (100 / (chargedVoltage - dischargedVoltage));
      }
    }

    return hourData;
  };

  self.backMonth = function(callStartFn,callEndFn) {
    callStart = callStartFn;
    callEnd = callEndFn;
    
    if(callStart) callStart();
    viewMonth--;
    getMonthView(viewMonth);
  };

  self.forwardMonth = function(callStartFn,callEndFn) {
    callStart = callStartFn;
    callEnd = callEndFn;
    
    if(callStart) callStart();
    viewMonth++;
    getMonthView(viewMonth);
  };
};