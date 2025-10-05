/*
* Author: Admin 
*/
OpenForum.includeScript("/OpenForum/AddOn/Tagging/TaggingClient.js");

//=========

tagstableDefinition = {columns: {
    "tableName": "tags",
    "rowsDefinition": "tag",
    "actions": {
        "edit": false,
        "move": false,
        "remove": false,
        "add": true,
        "save": true,
        "sort": true,
        "search": true
    },
    "tag": {
        "name": "tag",
        "dataName": "tag",
        "type": "text"
    }
},
rows: [
{
    "tag": ""
}
]};

//=========

tags=[];
newTags = [];
tags_rowTemplate = {"tag":""};
OpenForum.Table.addRow(tags,tags_rowTemplate);
//OpenForum.loadJSON("your page/tags.json",function(json){ tags=json; });


//=========

OpenForum.init = function() {
  TaggingClient.getTags(  function(response) {
    tags = response.data;
  });
};

function saveNewTags() {
  for(var n in newTags) {
  	TaggingClient.addTag( newTags[n], function(response) {
      console.log("Added tag " + newTags[n]);
    });
  }
  newTags = [];
}

function addTag( tag ) {
  tags.push(tag);
  newTags.push( tag );
}

