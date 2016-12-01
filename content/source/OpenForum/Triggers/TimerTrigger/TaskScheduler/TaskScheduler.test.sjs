/*
* Author: 
* Description: 
*/
var pageName="/OpenForum/Triggers/TimerTrigger/TaskScheduler";
var scriptFileName="trigger.sjs";

var tester = js.getObject("/OpenForum/Javascript/Tester","Test.sjs");
tester.log = function(message) { println("[Test Log] "+message); };
tester.logFailed = function(message) { println("[Test FAILED] "+message); };
tester.logPassed = function(message) { println("[Test PASSED] "+message); };
var script = file.getAttachment(pageName,scriptFileName);

var TaskSchedulerBuilder = eval( "function(log,file,Date,trigger){ return function() {"+script+"; return {schedule: schedule};}; };" );

var mockLog = js.getObject("/OpenForum/Javascript/Tester","MockLog.sjs").getMock();
var mockFile = js.getObject("/OpenForum/Javascript/Tester","MockFile.sjs").getMock();
var mockDate = js.getObject("/OpenForum/Javascript/Tester","MockDate.sjs").getMock(1000);
var mockTimerTrigger = js.getObject("/OpenForum/Javascript/Tester","MockTimerTrigger.sjs").getMock();

var schedule = [
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
  ];
mockFile.addMockFile( "/TestTask","trigger.sjs","function() {}",0 );
mockFile.addMockFile( "/OpenForum/Triggers/TimerTrigger/TaskScheduler","schedule.json",JSON.stringify(schedule),0 );
mockFile.addMockFile( "/Test","script-true.sjs","result = true;",0 );
mockFile.addMockFile( "/Test","script-false.sjs","result = false;",0 );

var TaskScheduler = TaskSchedulerBuilder(mockLog,mockFile,mockDate,mockTimerTrigger);

//===========================
mockTimerTrigger.resetMock();
tester.log("Running tests in "+pageName+"/"+scriptFileName);
	tester.unitTest("Every 10 seconds").given(null).when(TaskScheduler).thenEvaluationEquals( "schedule[0].lastRun","Thu Jan 01 1970 00:00:01 GMT-0000 (GMT)" ).run();

//===========================
mockTimerTrigger.resetMock();
schedule[0].scheduledTime="Every minute";
schedule[0].lastRun="";
mockFile.saveAttachment( "/OpenForum/Triggers/TimerTrigger/TaskScheduler","schedule.json",JSON.stringify(schedule),0 );

mockTimerTrigger.isMinutePeriod(true);
   tester.unitTest("Every minute run").given(null).when(TaskScheduler).thenEvaluationEquals( "schedule[0].lastRun","Thu Jan 01 1970 00:00:01 GMT-0000 (GMT)" ).run();

//===========================
mockTimerTrigger.resetMock();
schedule[0].scheduledTime="Every minute";
schedule[0].lastRun="";
mockFile.saveAttachment( "/OpenForum/Triggers/TimerTrigger/TaskScheduler","schedule.json",JSON.stringify(schedule),0 );

mockTimerTrigger.isMinutePeriod(false);
println("imp:"+mockTimerTrigger.isMinutePeriod());
   tester.unitTest("Every minute not run").given(null).when(TaskScheduler).thenEvaluationEquals( "schedule[0].lastRun","" ).run();

//===========================
mockTimerTrigger.resetMock();
schedule[0].scheduledTime="Every ten minutes";
schedule[0].lastRun="";
mockFile.saveAttachment( "/OpenForum/Triggers/TimerTrigger/TaskScheduler","schedule.json",JSON.stringify(schedule),0 );

mockTimerTrigger.isTenMinutePeriod(true);
   tester.unitTest("Every ten minutes run").given(null).when(TaskScheduler).thenEvaluationEquals( "schedule[0].lastRun","Thu Jan 01 1970 00:00:01 GMT-0000 (GMT)" ).run();

//===========================
mockTimerTrigger.resetMock();
schedule.scheduledTime="Every ten minutes";
schedule[0].lastRun="";
mockFile.saveAttachment( "/OpenForum/Triggers/TimerTrigger/TaskScheduler","schedule.json",JSON.stringify(schedule),0 );

mockTimerTrigger.isTenMinutePeriod(false);
schedule[0].lastRun="";
   tester.unitTest("Every ten minutes not run").given(null).when(TaskScheduler).thenEvaluationEquals( "schedule[0].lastRun","" ).run();

//===========================
mockTimerTrigger.resetMock();
schedule[0].scheduledTime="Every hour";
schedule[0].lastRun="";
mockFile.saveAttachment( "/OpenForum/Triggers/TimerTrigger/TaskScheduler","schedule.json",JSON.stringify(schedule),0 );

mockTimerTrigger.isHourPeriod(true);
   tester.unitTest("Every hour run").given(null).when(TaskScheduler).thenEvaluationEquals( "schedule[0].lastRun","Thu Jan 01 1970 00:00:01 GMT-0000 (GMT)" ).run();
//===========================
mockTimerTrigger.resetMock();
schedule[0].scheduledTime="Every hour";
schedule[0].lastRun="";
mockFile.saveAttachment( "/OpenForum/Triggers/TimerTrigger/TaskScheduler","schedule.json",JSON.stringify(schedule),0 );

mockTimerTrigger.isHourPeriod(false);
schedule[0].lastRun="";
   tester.unitTest("Every hour not run").given(null).when(TaskScheduler).thenEvaluationEquals( "schedule[0].lastRun","" ).run();

//===========================
mockTimerTrigger.resetMock();
schedule[0].scheduledTime="Every month";
schedule[0].lastRun="";
mockFile.saveAttachment( "/OpenForum/Triggers/TimerTrigger/TaskScheduler","schedule.json",JSON.stringify(schedule),0 );

mockTimerTrigger.isHourPeriod(true);

var date = new Date(1000);
date.setMonth(4);
date.setDate(1);
date.setHours(8);
mockDate = js.getObject("/OpenForum/Javascript/Tester","MockDate.sjs").getMock(date.getTime());

	tester.unitTest("Every month run").given(null).when(TaskScheduler).thenEvaluationEquals( "schedule[0].lastRun","Fri May 01 1970 08:00:01 GMT-0000 (GMT)" ).run();
//===========================
mockTimerTrigger.resetMock();
schedule[0].scheduledTime="Every month";
schedule[0].lastRun="";
mockFile.saveAttachment( "/OpenForum/Triggers/TimerTrigger/TaskScheduler","schedule.json",JSON.stringify(schedule),0 );

mockTimerTrigger.isHourPeriod(true);
date.setHours(9);
mockDate = js.getObject("/OpenForum/Javascript/Tester","MockDate.sjs").getMock(date.getTime());

	tester.unitTest("Every month not run").given(null).when(TaskScheduler).thenEvaluationEquals( "schedule[0].lastRun","" ).run();

//===========================
mockTimerTrigger.resetMock();
schedule[0].scheduledTime="Every year";
schedule[0].lastRun="";
mockFile.saveAttachment( "/OpenForum/Triggers/TimerTrigger/TaskScheduler","schedule.json",JSON.stringify(schedule),0 );

mockTimerTrigger.isHourPeriod(true);

var date = new Date(1000);
date.setMonth(0);
date.setDate(1);
date.setHours(8);
mockDate = js.getObject("/OpenForum/Javascript/Tester","MockDate.sjs").getMock(date.getTime());

	tester.unitTest("Every year run").given(null).when(TaskScheduler).thenEvaluationEquals( "schedule[0].lastRun","Thu Jan 01 1970 08:00:01 GMT-0000 (GMT)" ).run();
//===========================
mockTimerTrigger.resetMock();
schedule[0].scheduledTime="Every year";
schedule[0].lastRun="";
mockFile.saveAttachment( "/OpenForum/Triggers/TimerTrigger/TaskScheduler","schedule.json",JSON.stringify(schedule),0 );

mockTimerTrigger.isHourPeriod(true);
date.setMonth(1);
date.setDate(1);
date.setHours(8);
mockDate = js.getObject("/OpenForum/Javascript/Tester","MockDate.sjs").getMock(date.getTime());

	tester.unitTest("Every year not run").given(null).when(TaskScheduler).thenEvaluationEquals( "schedule[0].lastRun","" ).run();

//===========================
mockTimerTrigger.resetMock();
schedule[0].scheduledTime="Every week on Tuesday";
schedule[0].lastRun="";
mockFile.saveAttachment( "/OpenForum/Triggers/TimerTrigger/TaskScheduler","schedule.json",JSON.stringify(schedule),0 );

mockTimerTrigger.isHourPeriod(true);

var date = new Date(1000);
date.setMonth(0);
date.setDate(6);
date.setHours(8);
mockDate = js.getObject("/OpenForum/Javascript/Tester","MockDate.sjs").getMock(date.getTime());

	tester.unitTest("Every week on Tuesday run").given(null).when(TaskScheduler).thenEvaluationEquals( "schedule[0].lastRun","Tue Jan 06 1970 08:00:01 GMT-0000 (GMT)" ).run();
//===========================
mockTimerTrigger.resetMock();
schedule[0].scheduledTime="Every week on Tuesday";
schedule[0].lastRun="";
mockFile.saveAttachment( "/OpenForum/Triggers/TimerTrigger/TaskScheduler","schedule.json",JSON.stringify(schedule),0 );

mockTimerTrigger.isHourPeriod(true);
date.setMonth(0);
date.setDate(4);
date.setHours(8);
mockDate = js.getObject("/OpenForum/Javascript/Tester","MockDate.sjs").getMock(date.getTime());

	tester.unitTest("Every week on Tuesday not run").given(null).when(TaskScheduler).thenEvaluationEquals( "schedule[0].lastRun","" ).run();

//===========================
mockTimerTrigger.resetMock();
schedule[0].scheduledTime="Every day at 15:00";
schedule[0].lastRun="";
mockFile.saveAttachment( "/OpenForum/Triggers/TimerTrigger/TaskScheduler","schedule.json",JSON.stringify(schedule),0 );

mockTimerTrigger.isMinutePeriod(true);
var date = new Date(1000);
date.setMonth(5);
date.setDate(7);
date.setHours(15);
date.setMinutes(0);
mockDate = js.getObject("/OpenForum/Javascript/Tester","MockDate.sjs").getMock(date.getTime());

	tester.unitTest("Every day at 15:00 run").given(null).when(TaskScheduler).thenEvaluationEquals( "schedule[0].lastRun","Sun Jun 07 1970 15:00:01 GMT-0000 (GMT)" ).run();
//===========================
mockTimerTrigger.resetMock();
schedule[0].scheduledTime="Every day at 15:00";
schedule[0].lastRun="";
mockFile.saveAttachment( "/OpenForum/Triggers/TimerTrigger/TaskScheduler","schedule.json",JSON.stringify(schedule),0 );

mockTimerTrigger.isMinutePeriod(true);
date.setMonth(5);
date.setDate(7);
date.setHours(3);
date.setMinutes(0);
mockDate = js.getObject("/OpenForum/Javascript/Tester","MockDate.sjs").getMock(date.getTime());

	tester.unitTest("Every day at 15:00 not run").given(null).when(TaskScheduler).thenEvaluationEquals( "schedule[0].lastRun","" ).run();

//===========================
mockTimerTrigger.resetMock();
schedule[0].scheduledTime="On 06/02/2010 at 13:22";
schedule[0].lastRun="";
mockFile.saveAttachment( "/OpenForum/Triggers/TimerTrigger/TaskScheduler","schedule.json",JSON.stringify(schedule),0 );

mockTimerTrigger.isMinutePeriod(true);
var date = new Date(1000);
date.setMonth(3);
date.setDate(6);
date.setHours(13);
date.setMinutes(22);
mockDate = js.getObject("/OpenForum/Javascript/Tester","MockDate.sjs").getMock(date.getTime());

	tester.unitTest("On 06/02/2010 13:22 run").given(null).when(TaskScheduler).thenEvaluationEquals( "schedule[0].lastRun","Mon Apr 06 1970 13:22:01 GMT-0000 (GMT)" ).run();
//===========================
mockTimerTrigger.resetMock();
schedule[0].scheduledTime="On 06/02/2010 at 13:22";
schedule[0].lastRun="";
mockFile.saveAttachment( "/OpenForum/Triggers/TimerTrigger/TaskScheduler","schedule.json",JSON.stringify(schedule),0 );

mockTimerTrigger.isMinutePeriod(true);
date.setMonth(3);
date.setDate(6);
date.setHours(13);
date.setMinutes(27);
mockDate = js.getObject("/OpenForum/Javascript/Tester","MockDate.sjs").getMock(date.getTime());

	tester.unitTest("On 06/02/2010 at 13:22 not run").given(null).when(TaskScheduler).thenEvaluationEquals( "schedule[0].lastRun","" ).run();

//===========================
mockTimerTrigger.resetMock();
schedule[0].scheduledTime="On 06/02/2010";
schedule[0].lastRun="";
mockFile.saveAttachment( "/OpenForum/Triggers/TimerTrigger/TaskScheduler","schedule.json",JSON.stringify(schedule),0 );

mockTimerTrigger.isMinutePeriod(true);
var date = new Date(1000);
date.setMonth(3);
date.setDate(6);
date.setHours(8);
date.setMinutes(0);
mockDate = js.getObject("/OpenForum/Javascript/Tester","MockDate.sjs").getMock(date.getTime());

	tester.unitTest("On 06/02/2010 run").given(null).when(TaskScheduler).thenEvaluationEquals( "schedule[0].lastRun","Mon Apr 06 1970 08:00:01 GMT-0000 (GMT)" ).run();
//===========================
mockTimerTrigger.resetMock();
schedule[0].scheduledTime="On 06/02/2010 at 13:22";
schedule[0].lastRun="";
mockFile.saveAttachment( "/OpenForum/Triggers/TimerTrigger/TaskScheduler","schedule.json",JSON.stringify(schedule),0 );

mockTimerTrigger.isMinutePeriod(true);
date.setMonth(3);
date.setDate(6);
date.setHours(13);
date.setMinutes(27);
mockDate = js.getObject("/OpenForum/Javascript/Tester","MockDate.sjs").getMock(date.getTime());

	tester.unitTest("On 06/02/2010 at 13:22 not run").given(null).when(TaskScheduler).thenEvaluationEquals( "schedule[0].lastRun","" ).run();

//===========================
mockTimerTrigger.resetMock();
schedule[0].scheduledTime="script:{pageName:'/Test', fileName:'script-true.sjs'}";
schedule[0].lastRun="";
mockFile.saveAttachment( "/OpenForum/Triggers/TimerTrigger/TaskScheduler","schedule.json",JSON.stringify(schedule),0 );

mockTimerTrigger.isMinutePeriod(true);
date.setMonth(3);
date.setDate(6);
date.setHours(13);
date.setMinutes(27);
mockDate = js.getObject("/OpenForum/Javascript/Tester","MockDate.sjs").getMock(date.getTime());

	tester.unitTest("On script: /Test/script-true.sjs run").given(null).when(TaskScheduler).thenEvaluationEquals( "schedule[0].lastRun","Mon Apr 06 1970 13:27:01 GMT-0000 (GMT)" ).run();
//===========================
mockTimerTrigger.resetMock();
schedule[0].scheduledTime="script:{pageName:'/Test', fileName:'script-false.sjs'}";
schedule[0].lastRun="";
mockFile.saveAttachment( "/OpenForum/Triggers/TimerTrigger/TaskScheduler","schedule.json",JSON.stringify(schedule),0 );

mockTimerTrigger.isMinutePeriod(true);
date.setMonth(3);
date.setDate(6);
date.setHours(13);
date.setMinutes(27);
mockDate = js.getObject("/OpenForum/Javascript/Tester","MockDate.sjs").getMock(date.getTime());

	tester.unitTest("On script: /Test/script-false.sjs not run").given(null).when(TaskScheduler).thenEvaluationEquals( "schedule[0].lastRun","" ).run();

var results = tester.getResults();
tester.log("Completed tests in /OpenForum/Javascript/PageBuilder/default-page-builder.sjs Tests:"+results.tests+" Passed:"+results.passed+" Failed:"+results.failed);

