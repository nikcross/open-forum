/*
* Author: undefined 
* Description: 
*/
OpenForum.loadScript( "/OpenForum/Javascript/FluentTemplateProcessor/FluentTemplateProcessor.js" );

var data = OpenForum.loadFile( "/OpenForum/Javascript/FluentTemplateProcessor/example.template" );

templates = FluentTemplateProcessor.withTemplate( data );

var rows = templates.takeSection("row").setAllFields( { material: "a", units: "b", mpt: "c" } ).getResult();

console.log( rows );

var tables = templates.takeSection("table").setAllFields( {infoRows: rows} ).getResult();

console.log( tables );

var main = templates.takeSection("main").setAllFields( {title: "Iron", infoTables: tables} ).getResult();

console.log( main );
