if(!OpenForum) {
  OpenForum = {};
}

/*
* Author: Nik Cross
* Description: A set of functions to help with manipulating doms and js objects
*/

OpenForum.BLANK = ""; //Used in Extensions where "" cannot be used

OpenForum.createObjectSignature = function(object) {
  var cache = [];
  var signature = JSON.stringify(object, function(key, value) {
    if (typeof value === 'object' && value !== null) {
      if (cache.indexOf(value) !== -1) {
        // Circular reference found, discard key
        return;
      }
      // Store value in our collection
      cache.push(value);
    }
    return value;
  });
  cache = null;
  return signature;
};

OpenForum.copyElement = function(id) {
  document.getElementById(id).select();
  document.execCommand('copy');
};

OpenForum.copyData = function(data) {
  var hiddenElement = document.createElement('textarea');
  hiddenElement.value = data;
  document.body.appendChild( hiddenElement );
  hiddenElement.select();
  document.execCommand('copy');
  document.body.removeChild( hiddenElement );
};

OpenForum.setElement = function(id,content) {
  document.getElementById(id).innerHTML = content;
  OpenForum.crawl( document.getElementById(id) );
};

OpenForum.appendToElement = function(id,content) {
  
    var element = content;
    if( typeof content != "object" ) {
    	element = document.createElement( "span" );
    	element.innerHTML = content;
    }
    
    document.getElementById( id ).appendChild( element );
  
  OpenForum.crawl( document.getElementById(id) );
};

OpenForum.showElement = function(id, show) {
  
  if( typeof show != "undefined" && show == false ) {
    OpenForum.hideElement( id );
  } else {
  	document.getElementById(id).style.display = "block";
  }
};

OpenForum.hideElement = function(id) {
  document.getElementById(id).style.display = "none";
};

OpenForum.toggleElement = function(id) {
  if(document.getElementById(id).style.display==="block") {
    document.getElementById(id).style.display = "none";
  } else {
    document.getElementById(id).style.display = "block";
  }
};

OpenForum.setTitle = function(title) {
  document.title = title;
};

OpenForum.setCursor = function(pointer) {
  if(pointer == "wait") {
    document.body.style.cursor = 'wait';
    return;
  } else if(pointer == "zoom-in") {
    document.body.style.cursor = 'zoom-in';
    return;
  } else if(pointer == "pointer") {
    document.body.style.cursor = 'pointer';
    return;
  } else if(pointer == "crosshair") {
    document.body.style.cursor = 'crosshair';
    return;
  } else if(pointer == "default") {
    document.body.style.cursor = 'default';
    return;
  }
  
  if(pointer.indexOf(".")==-1) {
    pointer = "/OpenForum/Images/icons/png/" +pointer+ ".png";
  }
  
  document.getElementsByTagName("body")[0].style.cursor = "url('"+pointer+"'), auto";
};

OpenForum.setTabIcon = function(icon) {
  if(icon.indexOf(".")==-1) {
    icon = "/OpenForum/Images/icons/png/" +icon+ ".png";
  }
  
  var link = document.querySelector("link[rel~='icon']");
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.href = icon;
};

OpenForum.getParameter = function( name ) {
  name = name.replace(/[\[]/g,"\\\[").replace(/[\]]/g,"\\\]");
  var regexS = "[\\?&]"+name+"=([^&#]*)";
  var regex = new RegExp( regexS );
  var results = regex.exec( window.location.href );
  if( results === null )
    return "";
  else
    return results[1];
};

OpenForum.getCookie = function(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(';');
  for(var i=0;i < ca.length;i++)
  {
    var c = ca[i];
    while (c.charAt(0)==' ')
    {
      c = c.substring(1,c.length);
    }
    if (c.indexOf(nameEQ) === 0)
    {
      return c.substring(nameEQ.length,c.length);
    }
  }
  return null;
};

OpenForum.setCookie = function(name,value) {
  document.cookie = name + "=" + value;
};

OpenForum.deleteCookie = function(name) {
  document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
};

//Keep all the evil in one place
OpenForum.evaluate = function(script) {
  try{
    return eval(script);
  } catch (e) {
    OpenForum.debug( "ERROR", "Exception evaluating '" + script + "'",e );
    throw e;
  }
};

OpenForum.globalExists = function( name ) {
  name = name.replace(/\[/g,".").replace(/\]/g,"").replace(/'/g,"").replace(/\(.*\)/g,"");
  var parts = name.split(".");
  var obj = window;
  for(var part in parts) {
    if( typeof obj[parts[part]] === "undefined" ) return false;
    obj = obj[parts[part]];
  }

  return true;
};

OpenForum.getGlobal = function( name ) {
  name = name.replace(/\[/g,".").replace(/\]/g,"").replace(/'/g,"").replace(/\(.*\)/g,"");
  var parts = name.split(".");
  var obj = window;
  for(var part in parts) obj = obj[parts[part]];

  if(typeof obj === "function") return obj();
  else return obj;
};

OpenForum.setGlobal = function( name,value,create ) {
  name = name.replace(/\[/g,".").replace(/\]/g,"").replace(/'/g,"");
  var parts = name.split(".");
  var obj = window;
  var i=0;
  for(i=0; i<parts.length-1; i++) {
    if( typeof obj[parts[i]] === "undefined" && create===true ) obj[parts[i]] = {};
    obj = obj[parts[i]];
  }

  obj[parts[i]] = value;
};

OpenForum.isEqual = function(a,b,depth,maxDepth) {
  if(typeof b === undefined || typeof a === undefined) return false;
  if(b === null && a === null) return true;
  if(b === null || a === null) return false;
  if(typeof a !== typeof b) return false;

  if(!depth) {
    depth=0;
  }
  if(depth>maxDepth) {
    OpenForum.debug( "Maximum depth exceeded in isEqual." );
    return true;
  }
  if(!maxDepth) {
    maxDepth = 10;
  }

  if( typeof a === "object" ) {
    if(Array.isArray(a)) {
      if(!Array.isArray(b) || a.length!==b.length) return false;
    }
    if(Array.isArray(b)) {
      if(!Array.isArray(a) || a.length!==b.length) return false;
    }
    for(var i in a) {
      if(typeof b[i] === "undefined") return false;

      if( OpenForum.isEqual(a[i],b[i],depth+1,maxDepth)===false) return false;
    }
    return true;
  } else {
    return (a===b);
  }
};

OpenForum.copyDifferencesFromTo = function(a,b,depth,minDepth,maxDepth,doDelete) {
  if(!minDepth) {
    minDepth=1;
  }
  if(!maxDepth) {
    maxDepth = 10;
  }

  if(!depth) {
    depth=1;
  }

  if(depth>maxDepth) {
    OpenForum.debug( "Maximum depth exceeded in isEqual." );
    return null;
  }

  if(doDelete == false && Array.isArray(a) && Array.isArray(b)) {
    for(var i in a) {
      b.push( a[i] );
    }
    return b;
  }

  if( typeof a === "object" ) {

    for(var i in a) {
      if( typeof a[i] == "function" ) { // Do not clone objects with functions
        return null;
      }
    }

    for(var i in a) {
      if(!b[i]) {
        //If it doesn't exist, create it
        if(typeof a[i] === "object") {
          var value;
          if(a[i]==null) value = null;
          else if(Array.isArray(a[i])) value = OpenForum.copyDifferencesFromTo(a[i],[],depth+1,minDepth,maxDepth,doDelete);
          else value = OpenForum.copyDifferencesFromTo(a[i],{},depth+1,minDepth,maxDepth,doDelete);
          if(value==null) {
            if(depth<=maxDepth) {
              b[i] = a[i];
            } else {
              return null;
            }
          } else {
            b[i] = value;
          }
        } else {
          b[i] = a[i];
        }
      } else if( OpenForum.isEqual(a[i],b[i])===false) {
        //If it exists but is not equal, copy differences
        var value = OpenForum.copyDifferencesFromTo(a[i],b[i],depth+1,minDepth,maxDepth,doDelete);
        if(value!=null) {
          if(depth<=maxDepth) {
            b[i] = value;
          } else {
            return null;
          }
        }
      }
    }

    for(var i in b) {
      if(typeof a[i] == "undefined" && typeof b[i] != "undefined" ) {
        if(doDelete) {
          delete b[i];
        } else {
          a[i] = b[i];
        }
      }
    }
  } else {
    return a;
  }
  return b;
};

OpenForum.clone = function(a) {
  var b = {};
  if(a.length) b = [];
  OpenForum.copyDifferencesFromTo(a,b);
  return b;
};

OpenForum.clean = function(a) {
  if( typeof a === "object" ) {
    for(var i in a) {
      if(typeof a[i] === "object") {
        a[i] = OpenForum.clean(a[i]);
      } else if(typeof a[i] === "number") {
        a[i] = 0;
      } else if(typeof a[i] === "boolean") {
        a[i] = true;
      } else {
        a[i] = "";
      }
    }
  }
  return a;
};

OpenForum.addFunctionPrefix = function( fn1, fn2 ) {
  var secondFn = ""+fn1;
  var firstFunction = "" + fn2;
  firstFunction = firstFunction.substring(firstFunction.indexOf("{")+1, firstFunction.lastIndexOf("}")-1 );
  secondFn = "f = " + secondFn.substring(0,secondFn.indexOf("{")+1) + " " + firstFunction + " " + secondFn.substring( secondFn.indexOf("{")+1 );
  return OpenForum.evaluate( secondFn );
};

OpenForum.addFunctionSuffix = function( fn1, fn2 ) {
  var secondFn = ""+fn2;
  var firstFunction = "" + fn1;
  firstFunction = firstFunction.substring(firstFunction.indexOf("{")+1, firstFunction.lastIndexOf("}")-1 );
  secondFn = "f = " + secondFn.substring(0,secondFn.indexOf("{")+1) + " " + firstFunction + " " + secondFn.substring( secondFn.indexOf("{")+1 );
  return OpenForum.evaluate( secondFn );
};

OpenForum.setInterval = function(fn,timePeriod,immediate,blocking,doesCallback) {
  if(blocking) {
    var blocked = false;
    if(immediate) {
      blocked = true;
      try{
        if(doesCallback) {
          fn( function() {blocked = false;} );
        } else {
          fn();
          blocked = false;
        }
      } catch (e) {
        blocked = false;
      }
    }

    return setInterval( function() {
      if(blocked) return;
      blocked = true;
      try{
        if(doesCallback) {
          fn( function() {blocked = false;} );
        } else {
          fn();
          blocked = false;
        }
      } catch (e) {
        blocked = false;
      }
    }, timePeriod );

  } else {
    if(immediate) {
      fn();
      return setInterval(fn,timePeriod);
    }
  }
};

OpenForum.waitFor = function(test,callback,pause,timeout) {
  if(!pause) pause=200;
  if(!timeout) timeout = new Date().getTime()+30000;
  else if( new Date().getTime()>timeout ) throw "Timeout waiting for " + test;

  if(test()===true) {
    callback();
  } else {
    setTimeout( 
      function(test,callback,pause,timeout){ 
        return function() { 
          OpenForum.waitFor(test,callback,pause,timeout); 
        }; 
      }(
        test,
        callback,
        pause
      ),
      pause
    );
  }
};

OpenForum.runAsync = function(fn) {
  setTimeout( function() { fn(); },1 );
};

OpenForum.queue = function(process,supplyState) {
  var test = OpenForum.queue.ready;
  if(!test) test = function() { return true; };

  OpenForum.queue.ready = function() { return (!OpenForum.processing); };
  var state = {complete: false};
  if(supplyState===true) {
    OpenForum.queue.ready = function() { 
      if(state.complete===true) delete OpenForum.processing;
      return (state.complete); 
    };
  }

  OpenForum.waitFor(
    test,
    function() {
      OpenForum.processing = process;
      process(state);
      if(!supplyState) {
        delete OpenForum.processing;
      }
    }
  );
};

OpenForum.Table = {};

OpenForum.Table.setCell = function(table,row,column,value) {
  if(typeof value != "undefined") {
    table[row][column] = value;
  } else {
    //Is simple array so value is column
    table[row] = column;
  }
};

OpenForum.Table.editRow = function(table,index) {
  for(var i in table) {
    table[i].view = "display: block;";
    table[i].edit = "display: none;";
  }
  table[index].edit = "display: block;";
  table[index].view = "display: none;";
};

OpenForum.jsonToCsv = function(json,delimiter) {
  if(!delimiter) delimiter = "\t";
  var csv = "";
  if(Array.isArray(json)) {
    for(var i in json) {
      var row = json[i];

      //add column name row
      if(csv.length===0) {
        for (var c in row) {
          if(csv.length>0) {
            csv+=delimiter;
          }
          csv += c;
        }
        csv += "\n";
      }

      //add row
      var csvRow = "";
      for (var r in row) {
        if(csvRow.length>0) {
          csvRow+=delimiter;
        }
        csvRow += row[r];
      }
      csv += csvRow +"\n";
    }
  } else if(typeof json === "object") {
    for(var name in json) {
      csv += name + delimiter + json[name] + "\n";
    }
  }
  return csv;
};

OpenForum.Table.closeTable = function(table) {
  for(var i in table) {
    table[i].view = "display: block;";
    table[i].edit = "display: none;";
  }
};

OpenForum.Table.addRow = function(table,templateRow,clean) {
  if(!templateRow) {
    templateRow = table[table.length-1];
  }
  if(!templateRow.view) {
    templateRow.view = "display: block;";
    templateRow.edit = "display: none;";
  }
  var newRow = OpenForum.clone( templateRow );
  if(clean) {
    OpenForum.clean( newRow );
  }
  table.push( newRow );
  OpenForum.Table.editRow(table,table.length-1);
};

OpenForum.Table.removeRow = function(table,index) {
  return table.splice(index,1)[0];
};

OpenForum.Table.moveRowUp = function(table,index) {
  if(index<=0) return;
  var row = table.splice(index,1)[0];
  table.splice(index-1,0,row);
};

OpenForum.Table.moveRowDown = function(table,index) {
  if(index>=table.length-1) return;
  var row = table.splice(index,1)[0];
  table.splice(index+1,0,row);
};

OpenForum.Table.applyRowFilter = function(tableName,tableData,fieldName,fieldFilter) {
  var table = document.getElementById(tableName);

  var filters = [];
  var allBlank = true;
  if(typeof fieldFilter == "undefined" && fieldName.length) {
    //Assume array of filters
    filters = fieldName;
    for(var i in filters) {
      if(filters[i].fieldFilter!="") allBlank = false;
      filters[i].query = ".*"+filters[i].fieldFilter+".*";
    }
  } else {
    if(fieldFilter!="") allBlank = false;
    filters.push( {fieldName: fieldName, fieldFilter: fieldFilter, query: ".*"+fieldFilter+".*"} );
  }

  var index = 1;
  for(var i  in tableData) {
    var rowData = tableData[i];
    if(allBlank) {
      OpenForum.Table.showRow(table,index);
    } else {
      OpenForum.Table.showRow(table,index);
      for(var j in filters) {
        if( (filters[j].query != ".*.*") && (""+rowData[filters[j].fieldName]).match(filters[j].query) == null) {
          OpenForum.Table.hideRow(table,index);
        }
      }
    }
    index++;
  }
};

OpenForum.Table.sort = function(tableData,fieldName,ascending) {
  tableData.sort( 
    function(a,b) {
      if(ascending) {
        if(a[fieldName]<b[fieldName]) return 1; 
        else return -1;
      } else {
        if(a[fieldName]>b[fieldName]) return 1; 
        else return -1;
      }
    } 
  );
};

OpenForum.Table.hideRow = function(table,row) {
  var nodes = table.querySelectorAll('tbody tr:nth-child(' + row + ')');
  nodes.item(0).style.display = "none";
};

OpenForum.Table.showRow = function(table,row) {
  var nodes = table.querySelectorAll('tbody tr:nth-child(' + row + ')');
  nodes.item(0).style.display = "";
};

OpenForum.Table.renderTable = function(tableName,tableData) {
  var html = "<table id='"+tableName+"'>";

  html += "<thead><tr>"; 
  for(var n in tableData[0]) {
    html += "<td>" + n.replaceAll("_"," ") + "</td>";
  }
  html += "</tr></thead>";
  html += "<tbody>";
  for(var r in tableData) {
    var row = tableData[r];
    html += "<tr>";

    for(var n in row) {
      var cell = row[n];
      if((typeof n == "string" && n.indexOf("url")!=-1) || (typeof cell == "string" && cell.indexOf("http")!=-1)) {
        cell = "<a href='"+cell+"' target='url'>"+cell+"</a>";
      }
      html += "<td>" + cell + "</td>";
    }

    html += "</tr>";
  }
  html+= "</tr></tbody>"; 

  html+="</table>";
  return html;
};

