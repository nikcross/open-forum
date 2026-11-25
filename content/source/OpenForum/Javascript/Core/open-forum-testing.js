/*
* Author: 
* Description: 
*/
if(typeof OpenForum == "undefined") {
  OpenForum = { testing: {} };
} else if(typeof OpenForum.testing == "undefined") {
  OpenForum.testing = {};
}

OpenForum.testing.showComments = function() {
  var filterNone = function() {
    return NodeFilter.FILTER_ACCEPT;
  };

  var iterator = document.createNodeIterator(document.body, NodeFilter.SHOW_COMMENT, filterNone);

  var currentNode;
  while ( currentNode = iterator.nextNode() ) {
    try{
      
      var e =  document.createElement("div");
      
      //if(currentNode.nextElementSibling.offsetParent!=null) {
      var x = currentNode.nextElementSibling.offsetTop;
      var y = currentNode.nextElementSibling.offsetLeft;
      	e.style.position = "absolute";
      	e.style.top = x;
      	e.style.left = y;
      	e.style.color = "black";
      	e.style.backgroundColor = "white";
      	e.style.border = "solid 1px black";
      	e.style.borderRadius = "8px";
      	e.style.padding = "2px";
      	e.style.zIndex = "9999";
      //}
      e.innerHTML = "comment";
      e.title = currentNode.nodeValue;

      currentNode.nextElementSibling.insertAdjacentElement('beforeBegin',e);

      console.log("Displaying comment " + currentNode.nodeValue);
    } catch (ex) {
      console.log("Error displaying comment " + ex);
    }
  }

};

OpenForum.testing.showIds = function() {
  var filterNone = function() {
    return NodeFilter.FILTER_ACCEPT;
  };

  var iterator = document.createNodeIterator(document.body, NodeFilter.SHOW_ALL, filterNone);

  var currentNode;
  while ( currentNode = iterator.nextNode() ) {
    try{
      if(typeof currentNode.id == "undefined" || currentNode.id == "") continue;
      
      var e =  document.createElement("div");
      
      //if(currentNode.nextElementSibling.offsetParent!=null) {
      var x = currentNode.offsetTop;
      var y = currentNode.offsetLeft;
      	e.style.position = "absolute";
      	e.style.top = x;
      	e.style.left = y;
      	e.style.color = "black";
      	e.style.backgroundColor = "cyan";
      	e.style.border = "solid 1px black";
      	e.style.borderRadius = "2px";
      	e.style.padding = "2px";
      	e.style.zIndex = "9999";
      //}
      e.innerHTML = "id";
      e.title = currentNode.id;

      currentNode.insertAdjacentElement('beforeBegin',e);

      console.log("Displaying id " + currentNode.id);
    } catch (ex) {
      console.log("Error displaying id " + ex + " for " +currentNode.id);
    }
  }

};

OpenForum.testing.showNames = function() {
  var filterNone = function() {
    return NodeFilter.FILTER_ACCEPT;
  };

  var iterator = document.createNodeIterator(document.body, NodeFilter.SHOW_ALL, filterNone);

  var currentNode;
  while ( currentNode = iterator.nextNode() ) {
    try{
      if(typeof currentNode.name == "undefined" || currentNode.name == "") continue;
      
      var e =  document.createElement("div");
      
      //if(currentNode.nextElementSibling.offsetParent!=null) {
      var x = currentNode.offsetTop;
      var y = currentNode.offsetLeft;
      	e.style.position = "absolute";
      	e.style.top = x;
      	e.style.left = y;
      	e.style.color = "white";
      	e.style.backgroundColor = "black";
      	e.style.border = "solid 1px white";
      	e.style.borderRadius = "2px";
      	e.style.padding = "2px";
      	e.style.zIndex = "9999";
      //}
      e.innerHTML = "name";
      e.title = currentNode.name;

      currentNode.insertAdjacentElement('beforeBegin',e);

      console.log("Displaying id " + currentNode.id);
    } catch (ex) {
      console.log("Error displaying id " + ex + " for " +currentNode.id);
    }
  }

};

OpenForum.testing.readForm = function() {
  var data = {};
  var is = document.getElementsByTagName("input");
  for( var i in is ) {
    if( is[i].id ) {
      if(is[i].type == "radio") {
        data[ is[i].id ] =  is[i].checked;
      } else {
        data[ is[i].id ] =  is[i].value;
      }
    } else if( is[i].name ) {
      if(is[i].type == "radio") {
        data[ is[i].name ] =  is[i].checked;
      } else {
        data[ is[i].name ] =  is[i].value;
      }
    }
  }

  is = document.getElementsByTagName("select");
  for( var i in is ) {
    if( is[i].id ) {
      data[ is[i].id ] =  is[i].value;
    } else if( is[i].name ) {
      data[ is[i].name ] =  is[i].value;
    }
  }

  return data;
};

OpenForum.testing.writeToForm = function(data) {
  for(var i in data) {
    try{
      var el = document.getElementById(i);
      if(typeof el == "undefined") {
        el = document.getElementsByName(i)[0];
      }
      if(el.type=="radio") {
        if(data[i]==true) {
          el.checked=true;
          console.log( i + ".checked = true" );
        } else {
          el.checked=false;
          console.log( i + ".checked = false" );
        }
      } else {
        el.value = data[i];
        console.log( i + ".value set to " + el.value );
      }

    } catch(e) {
      console.log("In "+i);
      console.log("Ex:" + e);
    }
  }
};
