//---- Tree ----

var NextTreeNodeIndex = 0;
var TreeNodes = [];

function Tree(elementId,name,attributes,modifier) {
  var jsonModifier = function(json) {
    if(modifier) modifier(json);
  }
  
  var root = new TreeNode(name,attributes,null,jsonModifier);
  var elementId = elementId;

  this.setJSONModifier = function(newModifier) {
    modifier = newModifier;
  }
  
  this.render = function() {
    var element = document.getElementById(elementId);
    element.innerHTML = root.render(0);
    return this;
  };
  this.addChild = function(name,attributes) {
    return root.addChild(name,attributes);
  };
  this.addJSON = function(node) {
    return root.addJSON(node);
  };
  this.setJSON = function(node) {
    root = root.addJSON(node);
    return root;
  };
  this.render();

  this.expandAll = function() {
    root.applyToChildren( function(child){ child.expand(); } );
    root.expand();
    return this;
  };

  this.collapseAll = function() {
    root.applyToChildren( function(child){ child.collapse(); } );
    root.collapse();
    return this;
  };
  this.deleteChild = function(node) {
    node.parent.deleteChild(node);
    return this;
  };
  this.getRoot = function() {
    return root;
  };
  this.expandPath = function(path) {

    var nodePath = findPath(path);
    if(nodePath!==null) {
      nodePath.forEach( function(node) {node.expand(); } );
      return true;
    } else {
      return false;
    }
  };
  this.findNode = function(path) {
    return findPath(path);
  };
  this.init = function() {};
  var findPath = function(path) {
    if(path.charAt(0)==="/") {
      path = path.substring(1);
    }
    var parts = path.split("/");
    var node = root;
    var nodePath = [root];
    for(var i=0;i<parts.length;i++) {
      var children = node.getChildren();
      for(var c=0;c<children.length;c++) {
        if(children[c].getName()===parts[i]) {
          node = children[c];
          nodePath.push(node);
          break;
        }
      }
      if(c===children.length) {
        return null; //No path match
      }
    }
    return nodePath;
  };
}

var NextActionId=0;
var Actions = [];
function Action(config) {
  var fn = eval("("+config.fn+")");
  var icon = config.icon;
  var toolTip = config.toolTip;
  
  var id = "ActionId"+NextActionId;
  NextActionId++;
  Actions[id]=this;

  icon = "/OpenForum/Images/icons/png/" + icon + ".png";

  this.call = function(node) {
    fn(node);
  };
  this.render = function(target)
  {
    data="&nbsp;<a href='#' onClick='Actions[\""+id+"\"].call("+target+");return false;'>"+
      "<i style='background: url(\""+icon+"\") no-repeat scroll; min-width: 16px; min-height: 16px;	display: inline-block;' title='"+toolTip+"'></i></a>";
    return data;
  };
}

function TreeNode(name,attributes,parent,jsonModifier) {
  var that = this;
  var id = "TreeNode"+NextTreeNodeIndex;
  NextTreeNodeIndex++;
  TreeNodes[id] = this;
  var children = [];
  var expanded = false;
  var SPACE = "&nbsp;&nbsp;&nbsp;&nbsp;";
  var localDepth = 0;
  var lazyLoad = null;

  this.getId = function() {
    return id;
  };

  this.setLazyLoad = function(lazyLoadFn) {
    lazyLoad = lazyLoadFn;
    return this;
  };

  this.getParent = function() {
    return parent;
  }
  
  this.addChild = function(name,attributes) {
    var newChild = new TreeNode(name,attributes,this,jsonModifier);
    children[children.length] = newChild;
    newChild.parent = that;
    return newChild;
  };

  this.addJSON = function(node) {
    if(jsonModifier!=null) jsonModifier(node);
    var child = this.addChild( node.name,node.attributes );
    if(node.leaves) {
      for(var i in node.leaves) {
        child.addJSON( node.leaves[i] );
      }
    }
    child.parent = that;
    return child;
  };
  
  this.importJSON = function(url,action,parameters) {
    JSON.get(url,action,parameters).onSuccess(
      function(response) {
        for(var i in response.leaves) {
          that.addJSON( response.leaves[i] );
        }
        paint();
      }
    ).go();
  }
  
  this.deleteChild = function(node) {
    for(var index in children) {
      if(children[index].getId()===node.getId()) {
        children.splice(index,1);
        return this;
      }
    }
    return this;
  };

  this.expand = function() {
    if(lazyLoad!==null) {
      lazyLoad(that);
      lazyLoad = null;
      return this;
    }
    expanded=true;
    paint();
    return this;
  };
  this.collapse = function() {
    expanded=false;
    paint();
    return this;
  };
  this.toggle = function() {
    expanded=!expand;
    paint();
    return this;
  };
  var paint = function() {
    document.getElementById(id).innerHTML = that.render(localDepth);
  };

  this.render = function(depth) {
    if(!depth) {
      depth=0;
    }
    localDepth = depth;
    var data = "";
    data+="<span id='"+id+"'>";
    for(var count=0;count<depth;count++) {
      data+=SPACE;
    }
    if(children.length>0) {
      if(expanded===false) {
        data+="<a href='#' onClick='TreeNodes[\""+id+"\"].expand();return false;'>"+
          "<i  style='background: url(\"/OpenForum/Images/icons/png/add.png\") no-repeat scroll; min-width: 16px; min-height: 16px;	display: inline-block;'></i></a>";
      } else {
        data+="<a href='#' onClick='TreeNodes[\""+id+"\"].collapse();return false;'>"+
          "<i  style='background: url(\"/OpenForum/Images/icons/png/accept.png\") no-repeat scroll; min-width: 16px; min-height: 16px;	display: inline-block;'></i></a>";
      }
    } else {
      data+="&nbsp;";
    }
    if(attributes && attributes.link) {

      if(attributes.toolTip) {
        data += "<a href=\"" + attributes.link + "\" title=\""+ attributes.toolTip +"\" target=\"_pageView\">";
      } else {
        data += "<a href=\"" + attributes.link + "\" target=\"_pageView\">";
      }

      if(attributes.icon) {
        data += "<i style='background: url(\"/OpenForum/Images/icons/png/"+attributes.icon+".png\") no-repeat scroll; min-width: 16px; min-height: 16px;	display: inline-block;'></i>";
      }
      data += name;
      data += "</a>";
    } else {
      if(attributes.icon) {
        data += "<i style='background: url(\"/OpenForum/Images/icons/png/"+attributes.icon+".png\") no-repeat scroll; min-width: 16px; min-height: 16px;	display: inline-block;'></i>";
      }
      data += name;
    }
    if(attributes && attributes.actions) {
      for(var actionIndex in attributes.actions) {
        var actionConfig = attributes.actions[actionIndex];
        var action = new Action(actionConfig);
        data+=action.render("TreeNodes[\""+id+"\"]");
      }
    }
    data+="<br/>";
    if(expanded===true) {
      for(var childIndex in children) {
        data+=children[childIndex].render(depth+1);
      }
    }
    data+="</span>";
    return data;
  };
  this.getName = function() {
    return name;
  };
  this.setName = function(newName) {
    name = newName;
  };
  this.getAttribute = function(name) {
    return attributes[name];
  };
  this.applyToChildren = function( fn ) {
    children.forEach( fn(child) );
  };
  this.getChildren = function() {
    return children;
  };
}

OpenForum.createFileTree = function(id,root) {
  var tree = new Tree(id,"Loading...","");
  JSON.get("/OpenForum/Javascript/Tree","getPageTree","pageName="+root).onSuccess(
    function(result) {
      tree.setJSON(result);
      tree.render();
      tree.getRoot().expand();
      tree.init();
    }
  ).go();

  return tree;
};