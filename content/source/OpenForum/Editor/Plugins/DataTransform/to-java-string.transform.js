/*
* Author: Nik Cross
* Description: Takes input and converts to Java string
*/

var json = JSON.parse(input);
var data = JSON.stringify(json,null,4).split("\n");

var data = JSON.stringify(data,null,4);

output = data.replace(/,\n/g," + \n");