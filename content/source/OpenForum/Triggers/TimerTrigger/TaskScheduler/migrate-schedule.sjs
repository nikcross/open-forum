/*
* Author: 
* Description: 
*/
var DB = js.getObject("/OpenForum/AddOn/SQL","DB.sjs");
DB.setAlias("open-forum");

var schedules = file.getAttachment("/OpenForum/Triggers/TimerTrigger/TaskScheduler","schedule.json");
schedules = JSON.parse(schedules);

for(var i in schedules) {
  var triggerSchedule = schedules[i];
  var sql = "insert into triggerSchedule values('"+
      triggerSchedule.id+ "','"+
      triggerSchedule.name + "','"+
      triggerSchedule.pageName + "','"+
      triggerSchedule.scriptFile + "','"+
      triggerSchedule.lastRun + "','"+
      triggerSchedule.scheduledTime + "',"+
      triggerSchedule.enabled + ","+
      triggerSchedule.debug + ")";
  DB.execute(sql);
}

/*
 create table triggerSchedule (
	id text,
	name text,
	pageName text,
	scriptFile text,
	lastRun text,
	scheduledTime text,
	enabled boolean,
	debug boolean
)


------
    var result = DB.query("select * from triggerSchedule where ???");

    if(result.table.rows.row0) {
        var row = result.table.rows.row0;
      return {
        id: row.cell0,
        name: row.cell1,
        pageName: row.cell2,
        scriptFile: row.cell3,
        lastRun: row.cell4,
        scheduledTime: row.cell5,
        enabled: (row.cell6=="true"),
        debug: (row.cell7=="true")
      };
    }

------
    var result = DB.query("select * from triggerSchedule");
    var list = [];

    for(var i in result.table.rows) {
      var row = result.table.rows[i];
      var entry = {
        id: row.cell0,
        name: row.cell1,
        pageName: row.cell2,
        scriptFile: row.cell3,
        lastRun: row.cell4,
        scheduledTime: row.cell5,
        enabled: (row.cell6==true),
        debug: (row.cell7==true)


      };

      list.push(entry);
    }

    return list;

------

        var sql = "insert into triggerSchedule values('"+triggerSchedule.id: row.cell0+"','"+triggerSchedule.name: row.cell1+"','"+triggerSchedule.pageName: row.cell2+"','"+triggerSchedule.scriptFile: row.cell3+"','"+triggerSchedule.lastRun: row.cell4+"','"+triggerSchedule.scheduledTime: row.cell5+"',"+triggerSchedule.enabled: row.cell6+","+triggerSchedule.debug: row.cell7+")";
        DB.execute(sql);


------

        var sql = "update triggerSchedule set '"+triggerSchedule.id: row.cell0+"','"+triggerSchedule.name: row.cell1+"','"+triggerSchedule.pageName: row.cell2+"','"+triggerSchedule.scriptFile: row.cell3+"','"+triggerSchedule.lastRun: row.cell4+"','"+triggerSchedule.scheduledTime: row.cell5+"',"+triggerSchedule.enabled: row.cell6+","+triggerSchedule.debug: row.cell7+" where ???";
        DB.execute(sql);
*/