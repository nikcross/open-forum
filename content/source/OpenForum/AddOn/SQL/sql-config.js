/*
* Author: 
* Description: 
*/
var databases=[];
var dbRowTemplate = {"alias":"","url":"","user":"","password":""};
OpenForum.loadJSON('/OpenForum/Users/Admin/sql.config',function(data) { databases=data; OpenForum.Table.closeTable(databases); });