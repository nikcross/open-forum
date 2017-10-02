var action = transaction.getParameter("action");
if( action==null ) {
	transaction.setResult(transaction.SHOW_PAGE);
  return;
}

  action = ""+action; // Cast to String
  result = "";
  
  if(action === "getTimes") {
    var suncalc = js.loadObject("/GeoLocation","suncalc.js");
    var timeToJson = function(date) {
      return {hour: date.getHours(), minute: date.getMinutes()};
    };
    
    var dateToJson = function(date) {
      return {year: date.getFullYear(),month: date.getMonth()+1, day: date.getDate()};
    };
    
    var time = ""+transaction.getParameter("time");
    if(time==="today") {
      time = new Date();
    } else {
      var parts = time.split("/");
    	time = new Date().setYear( parseInt(parts[2]) ).setMonth( parseInt(parts[1])-1 ).setDate( parseInt(parts[0]) ).setHours(0).setMinutes(0).setSeconds(0);
    }
    var latitude = parseFloat(""+transaction.getParameter("latitude"));
    var longitude = parseFloat(""+transaction.getParameter("longitude"));
    
    var times = suncalc.getSunCalc().getTimes(time, latitude, longitude);
    time.latitude = latitude;
    time.longitude = longitude;
    time.time = dateToJson(time);
    time.action = action;
    time.sunrise = timeToJson(times.sunrise);
    time.sunset = timeToJson(times.sunset);
    
    time.solarNoon = timeToJson(times.solarNoon);
    time.nadir = timeToJson(times.nadir);
    time.sunriseEnd = timeToJson(times.sunriseEnd);
    time.sunsetStart = timeToJson(times.sunsetStart);
    time.dawn = timeToJson(times.dawn);
    time.dusk = timeToJson(times.dusk);
    time.nauticalDawn = timeToJson(times.nauticalDawn);
    time.nauticalDusk = timeToJson(times.nauticalDusk);
    time.nightEnd = timeToJson(times.nightEnd);
    time.night = timeToJson(times.night);
    time.goldenHourEnd = timeToJson(times.goldenHourEnd);
    time.goldenHour = timeToJson(times.goldenHour);
    
    result = JSON.stringify(time);
    
  } else {
  	result = "action not recognised";
  }

  transaction.sendPage( result );
