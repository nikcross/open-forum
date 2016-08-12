/*
* Author: Nik Cross
* Description: 
*/

function replaceNames(oldName,newName) {
	oldName = oldName.toLowerCase();
    newName = newName.toLowerCase();
    
    var oldNameParts = oldName.split(" ");
    var newNameParts = newName.split(" ");
    
    var oldNameConstant = "";
    var oldNameCamel = "";
    var oldNameCamelCaps = "";
    
    for(var i in oldNameParts) {
    	var part = oldNameParts[i];
        
        if(oldNameConstant.length>0) oldNameConstant+="_";
        oldNameConstant += part.toUpperCase();
        
        oldNameCamelCaps += part.substring(0,1).toUpperCase() + 
        	part.substring(1);
    }
    oldNameCamel += oldNameCamelCaps.substring(0,1).toLowerCase() + 
    	oldNameCamelCaps.substring(1);
    
    var newNameConstant = "";
    var newNameCamel = "";
    var newNameCamelCaps = "";
    
   for(var i in newNameParts) {
    	var part = newNameParts[i];
        
        if(newNameConstant.length>0) newNameConstant+="_";
        newNameConstant += part.toUpperCase();
        
        newNameCamelCaps += part.substring(0,1).toUpperCase() + 
        	part.substring(1);
    }
    newNameCamel += newNameCamelCaps.substring(0,1).toLowerCase() + 
    newNameCamelCaps.substring(1);
    
    input = input.replaceAll(oldNameCamel,newNameCamel);
	input = input.replaceAll(oldNameCamelCaps,newNameCamelCaps);
	input = input.replaceAll(oldNameConstant,newNameConstant);
}

replaceNames("media","trail category content parent");

output = input;