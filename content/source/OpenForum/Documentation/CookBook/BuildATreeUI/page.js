/*
* Author: 
*/
var tree;

var leafTemplate = {
  link: "",
  toolTip: "",
  icon: "",
  actions: []
};

var actionTemplate = {
  name: "",
  icon: "",
  fn: "",
  toolTip: ""
};

var treeJSON = {
  name: "ROOT", leaves: [
    {name: "Node A"},
    {name: "Node B"},
    {name: "Node C", expanded: true, leaves:[ 
      {name: "Node C1", link: "https://www.bbc.co.uk", toolTip: "BBC", icon: "link"},
      {name: "Node C2", toolTip: "Alert", attributes: {
        actions: [
          {name: "Show Alert", icon: "comment", fn: "function() { showAlert(); }", toolTip: "Show Alert"}
        ]
      },
       icon: "tag"},
      {name: "Node C3", attributes: {
        actions: [
          {name: "Delete", icon: "bin", fn: "function(node) { tree.deleteChild( node ); tree.render(); }", toolTip: "Delete Myself"}
        ]
      },},
      {name: "Node C4", attributes: {
        actions: [
          {name: "Add", icon: "add", fn: "function(node) { addChild(node); }", toolTip: "Add New"},
          {name: "Up", icon: "arrow_up", fn: "function(node) { moveUp(node); }", toolTip: "Move Up"},
          {name: "Down", icon: "arrow_down", fn: "function(node) { moveDown(node); }", toolTip: "Move Down"},
        ]
      },}
    ]},
    {name: "Node D"}
  ]
};

OpenForum.init = function() {
  tree = new Tree("tree","My Tree");
  tree.addJSON( treeJSON );
  tree.render();
};

function findNodeIndex( node, nodes ) {
  for(var i in nodes) {
    if(nodes[i].getId() == node.getId()) {
      return parseInt( i );
    }
  }
}

function moveUp( node ) {
  var nodes = node.getParent().getChildren();
  var index = findNodeIndex( node,nodes );
  OpenForum.Table.moveRowUp(nodes,index);
  tree.render();
}

function moveDown( node ) {
  var nodes = node.getParent().getChildren();
  var index = findNodeIndex( node,nodes );
  OpenForum.Table.moveRowDown(nodes,index);
  tree.render();
}

function addChild(node) {
  node.addJSON( {name: "New"} );
  node.expand();
  tree.render();
}

function showAlert() {
  alert( "ALERT" );
}
