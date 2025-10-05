/*
* Author: 
* Description: 
*/
var pageName="/OpenForum/Triggers/TimerTrigger/TaskScheduler";
var scriptFileName="trigger.sjs";

//test.log = function(message) { println("[Test Log] "+message); };
//test.logFailed = function(message) { println("[Test FAILED] "+message); };
//test.logPassed = function(message) { println("[Test PASSED] "+message); };
var script = file.getAttachment(pageName,scriptFileName);

// Wrap trigger.sjs in a function, inject mocks and return the schedule
var TaskSchedulerBuilder = eval( "function(log,file,Date,trigger,js){ return function() {"+script+"; return {schedule: schedule};}; };" );

var mockLog = js.getObject("/OpenForum/AddOn/Tester","MockLog.sjs").getMock(test);
var mockFile = js.getObject("/OpenForum/AddOn/Tester","MockFile.sjs").getMock(test);
var mockDate = js.getObject("/OpenForum/AddOn/Tester","MockDate.sjs").getMock(test,1000);
var mockTimerTrigger = js.getObject("/OpenForum/AddOn/Tester","MockTimerTrigger.sjs").getMock(test);
var mockJS = js.getObject("/OpenForum/AddOn/Tester","MockJS.sjs").getMock(test);
var mockDB = js.getObject("/OpenForum/AddOn/Tester","MockDB.sjs").getMock(test);
var mockAlert = js.getObject("/OpenForum/AddOn/Tester","MockAlert.sjs").getMock(test);

mockJS.includeRealObject( "/OpenForum/Javascript","Common.sjs" );
mockJS.addMockObject( "/OpenForum/AddOn/SQL","DB.sjs", mockDB );
mockJS.addMockObject( "/OpenForum/AddOn/Alert","Alert.sjs", mockAlert );


//Not used as now uses DB table
/*var schedule = [
    {
        "id": "task1",
        "name": "Manage Queues",
        "pageName": "/TestTask",
        "scriptFile": "trigger.sjs",
        "lastRun": "",
        "scheduledTime": "Every ten seconds",
        "enabled": true,
        "debug": true
    }
  ];*/

mockFile.addMockFile( "/TestTask","trigger.sjs","function() {}",0 );
//mockFile.addMockFile( "/OpenForum/Triggers/TimerTrigger/TaskScheduler","schedule.json",JSON.stringify(schedule),0 ); //Not used as now uses DB table
mockFile.addMockFile( "/Test","script-true.sjs","result = true;",0 );
mockFile.addMockFile( "/Test","script-false.sjs","result = false;",0 );

var taskScheduler = TaskSchedulerBuilder(mockLog,mockFile,mockDate,mockTimerTrigger,mockJS);

test.setDebug(false);
test.registerTestInstance( "taskScheduler" , taskScheduler );

//===========================
mockTimerTrigger.resetMock();
mockDB.setMockQuery( "select * from triggerSchedule", [["task1","/TestTask","trigger.sjs","","Every ten seconds","t","t"]] );

test.log("Running tests in "+pageName+"/"+scriptFileName);
test.unitTest("Every 10 seconds").
//given(null).
when("taskScheduler()").
thenEvaluationEquals( "schedule[0].lastRun","Thu Jan 01 1970 00:00:01 GMT-0000 (GMT)" ).
run();

//===========================
mockTimerTrigger.resetMock();
//schedule[0].scheduledTime="Every minute";
//schedule[0].lastRun="";
//mockFile.saveAttachment( "/OpenForum/Triggers/TimerTrigger/TaskScheduler","schedule.json",JSON.stringify(schedule),0 );
mockDB.setMockQuery( "select * from triggerSchedule", [["task1","/TestTask","trigger.sjs","","Every minute","t","t"]] );

mockTimerTrigger.isMinutePeriod(true);
test.unitTest("Every minute run").
//given(null).
when("taskScheduler()").
thenEvaluationEquals( "schedule[0].lastRun","Thu Jan 01 1970 00:00:01 GMT-0000 (GMT)" ).
run();

//===========================
mockTimerTrigger.resetMock();
//schedule[0].scheduledTime="Every minute";
//schedule[0].lastRun="";
//mockFile.saveAttachment( "/OpenForum/Triggers/TimerTrigger/TaskScheduler","schedule.json",JSON.stringify(schedule),0 );
mockDB.setMockQuery( "select * from triggerSchedule", [["task1","/TestTask","trigger.sjs","","Every minute","t","t"]] );

mockTimerTrigger.isMinutePeriod(false);
//println("imp:"+mockTimerTrigger.isMinutePeriod());
test.unitTest("Every minute not run").
//given(null).
when("taskScheduler()").
thenEvaluationEquals( "schedule[0].lastRun","" ).
run();


//===========================
mockTimerTrigger.resetMock();
//schedule[0].scheduledTime="Every ten minutes";
//schedule[0].lastRun="";
//mockFile.saveAttachment( "/OpenForum/Triggers/TimerTrigger/TaskScheduler","schedule.json",JSON.stringify(schedule),0 );
mockDB.setMockQuery( "select * from triggerSchedule", [["task1","/TestTask","trigger.sjs","","Every ten minutes","t","t"]] );

mockTimerTrigger.isTenMinutePeriod(true);
test.unitTest("Every ten minutes run").
//given(null).
when("taskScheduler()").
thenEvaluationEquals( "schedule[0].lastRun","Thu Jan 01 1970 00:00:01 GMT-0000 (GMT)" ).
run();

//===========================
mockTimerTrigger.resetMock();
//schedule.scheduledTime="Every ten minutes";
//schedule[0].lastRun="";
//mockFile.saveAttachment( "/OpenForum/Triggers/TimerTrigger/TaskScheduler","schedule.json",JSON.stringify(schedule),0 );
mockDB.setMockQuery( "select * from triggerSchedule", [["task1","/TestTask","trigger.sjs","","Every ten minutes","t","t"]] );

mockTimerTrigger.isTenMinutePeriod(false);
test.unitTest("Every ten minutes not run").
//given(null).
when("taskScheduler()").
thenEvaluationEquals( "schedule[0].lastRun","" ).
run();

//===========================
mockTimerTrigger.resetMock();
//schedule[0].scheduledTime="Every hour";
//schedule[0].lastRun="";
//mockFile.saveAttachment( "/OpenForum/Triggers/TimerTrigger/TaskScheduler","schedule.json",JSON.stringify(schedule),0 );
mockDB.setMockQuery( "select * from triggerSchedule", [["task1","/TestTask","trigger.sjs","","Every hour","t","t"]] );

mockTimerTrigger.isHourPeriod(true);
test.unitTest("Every hour run").
//given(null).
when("taskScheduler()").
thenEvaluationEquals( "schedule[0].lastRun","Thu Jan 01 1970 00:00:01 GMT-0000 (GMT)" ).
run();

//===========================
mockTimerTrigger.resetMock();
//schedule[0].scheduledTime="Every hour";
//schedule[0].lastRun="";
//mockFile.saveAttachment( "/OpenForum/Triggers/TimerTrigger/TaskScheduler","schedule.json",JSON.stringify(schedule),0 );
mockDB.setMockQuery( "select * from triggerSchedule", [["task1","/TestTask","trigger.sjs","","Every hour","t","t"]] );

mockTimerTrigger.isHourPeriod(false);
test.unitTest("Every hour not run").
//given(null).
when("taskScheduler()").
thenEvaluationEquals( "schedule[0].lastRun","" ).
run();

//===========================
mockTimerTrigger.resetMock();
//schedule[0].scheduledTime="Every month";
//schedule[0].lastRun="";
//mockFile.saveAttachment( "/OpenForum/Triggers/TimerTrigger/TaskScheduler","schedule.json",JSON.stringify(schedule),0 );

//name (text)	pagename (text)	scriptfile (text)	lastrun (text)	scheduledtime (text)	enabled (bool)	debug (bool)
mockDB.setMockQuery( "select * from triggerSchedule", [["task1","/TestTask","trigger.sjs","","Every month","t","t"]] );

mockTimerTrigger.isHourPeriod(true);

var date = new Date(1000);
date.setMonth(4);
date.setDate(1);
date.setHours(8);
mockDate.setMockTime( date.getTime() );

test.unitTest("Every month run").
//given(null).
when("taskScheduler()").
thenEvaluationEquals( "schedule[0].lastRun","Fri May 01 1970 08:00:01 GMT-0000 (GMT)" ).
run();
//===========================
mockTimerTrigger.resetMock();
//schedule[0].scheduledTime="Every month";
//schedule[0].lastRun="";
//mockFile.saveAttachment( "/OpenForum/Triggers/TimerTrigger/TaskScheduler","schedule.json",JSON.stringify(schedule),0 );
mockDB.setMockQuery( "select * from triggerSchedule", [["task1","/TestTask","trigger.sjs","","Every month","t","t"]] );

mockTimerTrigger.isHourPeriod(true);
date.setHours(9);
mockDate.setMockTime( date.getTime() );

test.unitTest("Every month not run").
//given(null).
when("taskScheduler()").
thenEvaluationEquals( "schedule[0].lastRun","" ).
run();

//===========================
mockTimerTrigger.resetMock();
//schedule[0].scheduledTime="Every year";
//schedule[0].lastRun="";
//mockFile.saveAttachment( "/OpenForum/Triggers/TimerTrigger/TaskScheduler","schedule.json",JSON.stringify(schedule),0 );
mockDB.setMockQuery( "select * from triggerSchedule", [["task1","/TestTask","trigger.sjs","","Every year","t","t"]] );

mockTimerTrigger.isHourPeriod(true);

var date = new Date(1000);
date.setMonth(0);
date.setDate(1);
date.setHours(8);
mockDate.setMockTime( date.getTime() );
mockDB.setMockQuery( "select * from triggerSchedule", [["task1","/TestTask","trigger.sjs","","Every year","t","t"]] );

test.unitTest("Every year run").
//given(null).
when("taskScheduler()").
thenEvaluationEquals( "schedule[0].lastRun","Thu Jan 01 1970 08:00:01 GMT-0000 (GMT)" ).
run();
//===========================
mockTimerTrigger.resetMock();
//schedule[0].scheduledTime="Every year";
//schedule[0].lastRun="";
//mockFile.saveAttachment( "/OpenForum/Triggers/TimerTrigger/TaskScheduler","schedule.json",JSON.stringify(schedule),0 );
mockDB.setMockQuery( "select * from triggerSchedule", [["task1","/TestTask","trigger.sjs","","Every year","t","t"]] );

mockTimerTrigger.isHourPeriod(true);
date.setMonth(1);
date.setDate(1);
date.setHours(8);
mockDate.setMockTime( date.getTime() );

test.unitTest("Every year not run").
//given(null).
when("taskScheduler()").
thenEvaluationEquals( "schedule[0].lastRun","" ).
run();

//===========================
mockTimerTrigger.resetMock();
//schedule[0].scheduledTime="Every week on Tuesday";
//schedule[0].lastRun="";
//mockFile.saveAttachment( "/OpenForum/Triggers/TimerTrigger/TaskScheduler","schedule.json",JSON.stringify(schedule),0 );
mockDB.setMockQuery( "select * from triggerSchedule", [["task1","/TestTask","trigger.sjs","","Every week on Tuesday","t","t"]] );

mockTimerTrigger.isHourPeriod(true);

var date = new Date(1000);
date.setMonth(0);
date.setDate(6);
date.setHours(8);
mockDate.setMockTime( date.getTime() );

test.unitTest("Every week on Tuesday run").
//given(null).
when("taskScheduler()").
thenEvaluationEquals( "schedule[0].lastRun","Tue Jan 06 1970 08:00:01 GMT-0000 (GMT)" ).
run();

//===========================
mockTimerTrigger.resetMock();
//schedule[0].scheduledTime="Every week on Tuesday";
//schedule[0].lastRun="";
//mockFile.saveAttachment( "/OpenForum/Triggers/TimerTrigger/TaskScheduler","schedule.json",JSON.stringify(schedule),0 );
mockDB.setMockQuery( "select * from triggerSchedule", [["task1","/TestTask","trigger.sjs","","Every week on Tuesday","t","t"]] );

mockTimerTrigger.isHourPeriod(true);
date.setMonth(0);
date.setDate(4);
date.setHours(8);
mockDate.setMockTime( date.getTime() );

test.unitTest("Every week on Tuesday not run").
//given(null).
when("taskScheduler()").
thenEvaluationEquals( "schedule[0].lastRun","" ).
run();

//===========================
mockTimerTrigger.resetMock();
//schedule[0].scheduledTime="Every day at 15:00";
//schedule[0].lastRun="";
//mockFile.saveAttachment( "/OpenForum/Triggers/TimerTrigger/TaskScheduler","schedule.json",JSON.stringify(schedule),0 );
mockDB.setMockQuery( "select * from triggerSchedule", [["task1","/TestTask","trigger.sjs","","Every day at 15:00","t","t"]] );

mockTimerTrigger.isMinutePeriod(true);
var date = new Date(1000);
date.setMonth(5);
date.setDate(7);
date.setHours(15);
date.setMinutes(0);
mockDate.setMockTime( date.getTime() );

test.unitTest("Every day at 15:00 run").
//given(null).
when("taskScheduler()").
thenEvaluationEquals( "schedule[0].lastRun","Sun Jun 07 1970 15:00:01 GMT-0000 (GMT)" ).
run();

//===========================
mockTimerTrigger.resetMock();
//schedule[0].scheduledTime="Every day at 15:00";
//schedule[0].lastRun="";
//mockFile.saveAttachment( "/OpenForum/Triggers/TimerTrigger/TaskScheduler","schedule.json",JSON.stringify(schedule),0 );
mockDB.setMockQuery( "select * from triggerSchedule", [["task1","/TestTask","trigger.sjs","","Every day at 15:00","t","t"]] );

mockTimerTrigger.isMinutePeriod(true);
date.setMonth(5);
date.setDate(7);
date.setHours(3);
date.setMinutes(0);
mockDate.setMockTime( date.getTime() );

test.unitTest("Every day at 15:00 not run").
//given(null).
when("taskScheduler()").
thenEvaluationEquals( "schedule[0].lastRun","" ).
run();

//===========================
mockTimerTrigger.resetMock();
//schedule[0].scheduledTime="On 06/02/2010 at 13:22";
//schedule[0].lastRun="";
//mockFile.saveAttachment( "/OpenForum/Triggers/TimerTrigger/TaskScheduler","schedule.json",JSON.stringify(schedule),0 );
mockDB.setMockQuery( "select * from triggerSchedule", [["task1","/TestTask","trigger.sjs","","On 06/02/2010 at 13:22","t","t"]] );

mockTimerTrigger.isMinutePeriod(true);
var date = new Date(1000);
date.setMonth(3);
date.setDate(6);
date.setHours(13);
date.setMinutes(22);
mockDate.setMockTime( date.getTime() );

test.unitTest("On 06/02/2010 13:22 run").
//given(null).
when("taskScheduler()").
thenEvaluationEquals( "schedule[0].lastRun","Mon Apr 06 1970 13:22:01 GMT-0000 (GMT)" ).
run();

//===========================
mockTimerTrigger.resetMock();
//schedule[0].scheduledTime="On 06/02/2010 at 13:22";
//schedule[0].lastRun="";
//mockFile.saveAttachment( "/OpenForum/Triggers/TimerTrigger/TaskScheduler","schedule.json",JSON.stringify(schedule),0 );
mockDB.setMockQuery( "select * from triggerSchedule", [["task1","/TestTask","trigger.sjs","","On 06/02/2010 at 13:22","t","t"]] );

mockTimerTrigger.isMinutePeriod(true);
date.setMonth(3);
date.setDate(6);
date.setHours(13);
date.setMinutes(27);
mockDate.setMockTime( date.getTime() );

test.unitTest("On 06/02/2010 at 13:22 not run").
//given(null).
when("taskScheduler()").
thenEvaluationEquals( "schedule[0].lastRun","" ).
run();

//===========================
mockTimerTrigger.resetMock();
//schedule[0].scheduledTime="On 06/02/2010";
//schedule[0].lastRun="";
//mockFile.saveAttachment( "/OpenForum/Triggers/TimerTrigger/TaskScheduler","schedule.json",JSON.stringify(schedule),0 );
mockDB.setMockQuery( "select * from triggerSchedule", [["task1","/TestTask","trigger.sjs","","On 06/02/2010","t","t"]] );

mockTimerTrigger.isMinutePeriod(true);
var date = new Date(1000);
date.setMonth(3);
date.setDate(6);
date.setHours(8);
date.setMinutes(0);
mockDate.setMockTime( date.getTime() );

test.unitTest("On 06/02/2010 run").
//given(null).
when("taskScheduler()").
thenEvaluationEquals( "schedule[0].lastRun","Mon Apr 06 1970 08:00:01 GMT-0000 (GMT)" ).
run();

//===========================
mockTimerTrigger.resetMock();
//schedule[0].scheduledTime="On 06/02/2010 at 13:22";
//schedule[0].lastRun="";
//mockFile.saveAttachment( "/OpenForum/Triggers/TimerTrigger/TaskScheduler","schedule.json",JSON.stringify(schedule),0 );
mockDB.setMockQuery( "select * from triggerSchedule", [["task1","/TestTask","trigger.sjs","","On 06/02/2010 at 13:22","t","t"]] );

mockTimerTrigger.isMinutePeriod(true);
date.setMonth(3);
date.setDate(6);
date.setHours(13);
date.setMinutes(27);
mockDate.setMockTime( date.getTime() );

test.unitTest("On 06/02/2010 at 13:22 not run").
//given(null).
when("taskScheduler()").
thenEvaluationEquals( "schedule[0].lastRun","" ).
run();

//===========================
mockTimerTrigger.resetMock();
//schedule[0].scheduledTime="script:{pageName:'/Test', fileName:'script-true.sjs'}";
//schedule[0].lastRun="";
//mockFile.saveAttachment( "/OpenForum/Triggers/TimerTrigger/TaskScheduler","schedule.json",JSON.stringify(schedule),0 );
mockDB.setMockQuery( "select * from triggerSchedule", [["task1","/TestTask","trigger.sjs","","script:{pageName:'/Test', fileName:'script-true.sjs'}","t","t"]] );

mockTimerTrigger.isMinutePeriod(true);
date.setMonth(3);
date.setDate(6);
date.setHours(13);
date.setMinutes(27);
mockDate.setMockTime( date.getTime() );

test.unitTest("On script: /Test/script-true.sjs run").
//given(null).
when("taskScheduler()").
thenEvaluationEquals( "schedule[0].lastRun","Mon Apr 06 1970 13:27:01 GMT-0000 (GMT)" ).
run();

//===========================
mockTimerTrigger.resetMock();
//schedule[0].scheduledTime="script:{pageName:'/Test', fileName:'script-false.sjs'}";
//schedule[0].lastRun="";
//mockFile.saveAttachment( "/OpenForum/Triggers/TimerTrigger/TaskScheduler","schedule.json",JSON.stringify(schedule),0 );
mockDB.setMockQuery( "select * from triggerSchedule", [["task1","/TestTask","trigger.sjs","","script:{pageName:'/Test', fileName:'script-false.sjs'}","t","t"]] );

mockTimerTrigger.isMinutePeriod(true);
date.setMonth(3);
date.setDate(6);
date.setHours(13);
date.setMinutes(27);
mockDate.setMockTime( date.getTime() );

test.unitTest("On script: /Test/script-false.sjs not run").
//given(null).
when("taskScheduler()").
thenEvaluationEquals( "schedule[0].lastRun","" ).
run();

var results = test.getResults();
test.log("Completed tests in /OpenForum/Javascript/PageBuilder/default-page-builder.sjs Tests:"+results.tests+" Passed:"+results.passed+" Failed:"+results.failed);

