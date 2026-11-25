/*
Author: 
Description: 
*/

OpenForum.loadScript("/OpenForum/AddOn/Tester/Test.js");

new Process().waitFor( function() { return( typeof Test != "undefined" ); } ).then( function() {
  
  var input = { a: [ "value a", "value b", {testField: "testing"} ] };
  var expected = { a: [ "value a", "value b", {testField: "testing"} ] };
  var output = {};
  
  new Test().unitTest("Copy Structure").
    given(input).
	    when( OpenForum.copyDifferencesFromTo(input,output) ).
	    thenOutputPassesTest( function( output ) {
    		return OpenForum.isEqual( output, expected );
  		}).
	    run();
  
  new Test().unitTest("Copied Structure is new").
    given(input).
	    when( function() {
    		OpenForum.copyDifferencesFromTo(input,output); 
    		input.a[0] = "changed";
    		input.a[2].testField = "changed";
    		return output;
  		}).
	    thenOutputPassesTest( function( output ) {
    		return OpenForum.isEqual( output, expected );
  		}).
	    run();
  
}).run();

