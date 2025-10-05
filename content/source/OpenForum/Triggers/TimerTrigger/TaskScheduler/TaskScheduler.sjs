/*
* Author: 
* Description: 
*/
/*
* Author: 
* Description: 
*/
var TaskScheduler = function() {
  var self = this;
  var config = openForum.retrieveObject("config");

  var DB = js.getObject("/OpenForum/AddOn/SQL","DB.sjs");
  DB.setAlias( config.getValue("database") );
  var adminEmail = config.getValue("adminEmail");

  self.getSchedule = function(tag) {

    var query = "select name, pagename, scriptfile, lastrun, scheduledtime, enabled, debug from triggerSchedule order by name";

    if( typeof tag != "undefined" && tag != null && tag != "null" ) {
      query = "select DISTINCT (s.*), t.tag from triggerSchedule s join tag_link t on t.tag='" +tag+ "' "+
        " and ("+
        " (t.wild_card='t' and t.name like s.name) or"+
        " (t.wild_card='t' and t.case_sensitive='f' and upper(t.name) like upper(s.name)) or"+
        " (t.wild_card='f' and t.name = s.name) or"+
        " (t.wild_card='f' and t.case_sensitive='f' and upper(t.name) = upper(s.name))"+
        ")"+
        " and (t.type='Task' or t.type='All')";
    }

    var sql = {
      query: query
    };
    
    var result = DB.run( sql );

    return result;
  };

  self.addTask = function(name, pageName, scriptFile, lastRun, scheduledTime, enabled, debug) {
    var sql = "insert into triggerSchedule values("+
        "'" + name+"','"+
        pageName+"','"+
        scriptFile+"','"+
        lastRun+"','"+
        scheduledTime+"',"+
        enabled+","+
        debug+")"+
        " ON CONFLICT (name) DO UPDATE SET "+
        " name = '"+
        name+"', pageName = '"+
        pageName+"', scriptFile = '"+
        scriptFile+"', lastRun = '"+
        lastRun+"',scheduledTime = '"+
        scheduledTime+"', enabled = "+
        enabled+", debug = "+
        debug;

    DB.execute(sql);
    return "ok";
  };

  self.deleteTask = function(name) {
    DB.execute("delete from triggerSchedule where name='"+name+"'");
    return "ok";
  };
};