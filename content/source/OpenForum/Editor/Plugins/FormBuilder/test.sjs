/*
* Author: Admin 
* Description: 
*/

if( typeof OpenForum == "undefined" ) OpenForum = {};
println( "1" );
OpenForum.TableBuilder = js.getObject( "/OpenForum/Editor/Plugins/TableBuilder" , "TableBuilder.js" );
println( "2" );

OpenForum.FormBuilder = js.getObject( "/OpenForum/Editor/Plugins/FormBuilder" , "FormBuilder.js" );
println( "2b" );
OpenForum.FormBuilder.setTableBuilder( OpenForum.TableBuilder );
println( "3" );

var table = OpenForum.FormBuilder.buildForm( "Table: table a,b,c", "theForm" );

println( "4" );
println( ""+table.html );

println( "5" );