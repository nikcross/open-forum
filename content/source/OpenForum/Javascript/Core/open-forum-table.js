//---- OpenForumTable ----

function OpenForumTable(node) {
  var self = this;
  var rowNode = node;
  var tableNode = node.parentNode;
  var value;
  var id;

  if(tableNode.attributes && tableNode.attributes['of-id']) {
    id=tableNode.attributes['of-id'].value;
    /*if( this.tableNode.value ) {
      this.tableNode.value = eval(this.tableNode.id);
      eval(this.tableNode.id+"=\""+this.value+"\";")
    }*/
  } else if(tableNode.id) {
    id=tableNode.id;
  } else {
    id="OFTable"+OpenForum.getNextId();
  } 

  node.parentNode.removeChild(node);

  var temp = document.createElement("table");
  temp.appendChild(node);

  var rowHTML = temp.innerHTML;
  var repeatFor = node.attributes['of-repeatFor'].value;
  var target = repeatFor.substring(repeatFor.indexOf(" in ")+4);
  var element = repeatFor.substring(0,repeatFor.indexOf(" in "));
  var targetObject = OpenForum.getObject(target);
  var targetObjectSignature = OpenForum.createObjectSignature( targetObject.getValue() );

  if(id.indexOf("OFTable")===0) id += " " + repeatFor;
  
  OpenForum.debug("INFO","Added OpenForum table " + repeatFor + " as " + id);
  
  var tableTop = tableNode.innerHTML;
  tableNode.id = id;

  self.setTableNode = function(newTableNode) {
    tableNode = newTableNode;
  };

  self.reset = function() {
    targetObjectSignature = null;
    value = null;
  };
  
  self.refresh = function() {

    try {
      if(tableNode.attributes && tableNode.attributes['of-id'] && typeof tableNode.value != "undefined" ) {
        //Not sure what the empty string was there for, but it stops select working
        //if( this.tableNode.value!=this.value && this.value!="") {
        if( tableNode.value!=value) {
          value = tableNode.value;
          OpenForum.setGlobal(tableNode.id,value);
          
          OpenForum.debug("INFO","Table " + id + " value changed to " + value);
        } else {
          var newValue = OpenForum.getGlobal(tableNode.id);
          if( typeof tableNode.value !== "undefined" && tableNode.value!=newValue && typeof newValue !== "undefined" && newValue !== null ) {
            tableNode.value=newValue;
            value = newValue;
            if(tableNode.value === newValue) {
              OpenForum.debug("INFO","Table " + id + " value changed to " + value);
            }
          }
        }
      }
    } catch(e) {
        OpenForum.debug("ERROR","Table " + id + " set value failed.", e);
    }

    //check if changed
    var objectSignature = OpenForum.createObjectSignature( targetObject.getValue() );
    if(objectSignature==targetObjectSignature) {
      return;
    }
    targetObjectSignature=objectSignature;

    var tableData = tableTop;
    var collection = targetObject.getValue();
    for( var elementIndex in collection ) {
      try {
        var item = {};
        item[element]= collection[elementIndex];
        item[element].index = elementIndex;

        var data = ""+rowHTML;
        while(data.indexOf(OpenForum.FIELD_DELIMETER_START)!=-1) {
          var name = data.substring(data.indexOf(OpenForum.FIELD_DELIMETER_START)+2,data.indexOf(OpenForum.FIELD_DELIMETER_END));
          var parts = name.split(".");
          var rowValue = item;
          for(var part in parts) {
            if(parts[part].indexOf("(")!==-1) {
              var fn = parts[part].substring(0,parts[part].indexOf("("));
              var call = parts[part].substring(parts[part].indexOf("("),parts[part].indexOf(")")).split(",");
              rowValue = rowValue[fn].apply( this,call );
            } else {
              rowValue = rowValue[parts[part]];
            }
          }
          
          data = data.substring(0,data.indexOf(OpenForum.FIELD_DELIMETER_START))+
            rowValue+
            data.substring(data.indexOf(OpenForum.FIELD_DELIMETER_END)+2);


          if( tableNode.type=="select-one") {
            if(OpenForum.getGlobal(id) === rowValue ) {
              data = data.replace("selected=\"\"","selected");
              
              OpenForum.debug("INFO","Table " + id + " selected  = " + rowValue);
            } else {
              data = data.replace("selected=\"\"","");
            }
          }
        }
        tableData += data;
	
        OpenForum.debug("INFO","Table " + id + " updated.");    
      } catch(e) {
        OpenForum.debug("ERROR","Table " + id + " refresh failed.", e);
      }
    }
    tableNode.innerHTML=tableData;
  };
  
  self.getId = function() {
    return id;
  };
}