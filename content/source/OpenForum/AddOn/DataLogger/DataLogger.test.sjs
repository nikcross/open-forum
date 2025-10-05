/*
* Author: 
* Description: 
*/

var dataLogger = js.getObject("/OpenForum/AddOn/DataLogger","DataLogger.sjs");
var tester = js.getObject("/OpenForum/Javascript/Tester","Test.sjs");

tester.log("Running tests in /OpenForum/AddOn/DataLogger/DataLogger.sjs");


tester.unitTest("Can create pageName for dot separated file").
                                                                given("").
                                                                when( dataLogger.getPathFor("a.bee.cee.d.txt",dataLogger.NAME_MODE_PATH) ).
																	thenAttributeEquals( "pageName","/a/bee/cee/d/" ).
                                                                    run();

tester.unitTest("Can create fileName for dot separated file name").
                                                                given("").
                                                                when( dataLogger.getPathFor("a.bee.cee.d.txt",dataLogger.NAME_MODE_PATH) ).
                                                                thenAttributeEquals( "fileName","a.bee.cee.d.txt").
                                                                    run();

tester.unitTest("Can create pageName for text file name").
                                                                given("").
                                                                when( dataLogger.getPathFor("abcde.txt",dataLogger.NAME_MODE_TEXT) ).
                                                                thenAttributeEquals("pageName","/a/ab/abcd/").
                                                                    run();

tester.unitTest("Can create fileName for text file name").
                                                                given("").
                                                                when( dataLogger.getPathFor("abcde.txt",dataLogger.NAME_MODE_TEXT) ).
                                                                thenAttributeEquals("fileName","abcde.txt").
                                                                    run();

var time = new Date();
time.setTime(0);
time.setYear(2016);
time.setMonth(4);
time.setDate(15);
time.setHours(3);
time.setMinutes(15);
time.setSeconds(7);

tester.unitTest("Can create pageName for day log file name").
                                                                given("").
                                                                when( dataLogger.getPathFor("abcde.txt",dataLogger.NAME_MODE_TEXT,dataLogger.TIME_MODE_DAY,time) ).
                                                                thenAttributeEquals("pageName","/a/ab/abcd/2016/05/").
                                                                    run();

tester.unitTest("Can create fileName for day log file name").
                                                                given("").
                                                                when( dataLogger.getPathFor("abcde.txt",dataLogger.NAME_MODE_TEXT,dataLogger.TIME_MODE_DAY,time) ).
                                                                thenAttributeEquals("fileName","abcde-2016-05-15.txt").
                                                                    run();

tester.unitTest("Can create pageName for time log file name").
                                                                given("").
                                                                when( dataLogger.getPathFor("abcde.txt",dataLogger.NAME_MODE_TEXT,dataLogger.TIME_MODE_TIME,time) ).
                                                                thenAttributeEquals("pageName","/a/ab/abcd/2016/05/15/").
                                                                    run();

tester.unitTest("Can create fileName for time log file name").
                                                                given("").
                                                                when( dataLogger.getPathFor("abcde.txt",dataLogger.NAME_MODE_TEXT,dataLogger.TIME_MODE_TIME,time) ).
                                                                thenAttributeEquals("fileName","abcde-2016-05-15-03-15-07.txt").
                                                                    run();

tester.unitTest("Can create pageName for timestamp log file name").
                                                                given("").
                                                                when( dataLogger.getPathFor("abcde.txt",dataLogger.NAME_MODE_TEXT,dataLogger.TIME_MODE_TIMESTAMP,time) ).
                                                                thenAttributeEquals("pageName","/a/ab/abcd/2016/05/15/").
                                                                    run();

tester.unitTest("Can create fileName for timestamp log file name").
                                                                given("").
                                                                when( dataLogger.getPathFor("abcde.txt",dataLogger.NAME_MODE_TEXT,dataLogger.TIME_MODE_TIMESTAMP,time) ).
                                                                thenAttributeEquals("fileName","abcde-1463282107000.txt").
                                                                    run();


var results = tester.getResults();

tester.log("Completed tests in /OpenForum/AddOn/DataLogger/DataLogger.sjs Tests:"+results.tests+
           " Passed:"+results.passed+
           " Failed:"+results.failed
          );
