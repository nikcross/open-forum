/*
* Author: Nik Cross
* Description: Takes input and converts to string
*/
var data = input.split("\n");

var data = JSON.stringify(data,null,4);

output = data.replace(/,\n/g," + \n");