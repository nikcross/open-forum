OpenForum.init = function() {
	createFileTree("tree","/OpenForum/Javascript");
};

function createFileTree(id,root) {
  var tree = new Tree(id,"Loading...","");
  JSON.get("/OpenForum/Javascript/Tree","getPageTree","pageName="+root).onSuccess(
    function(result) {
      augmentTree(result.leaves);
      
      tree.setJSON(result);
      tree.render();
      tree.getRoot().expand();
      tree.init();
    }
  ).go();

  return tree;
};

function augmentTree(leaves) {
  for(var i=0;i<leaves.length;i++) {
    var leaf = leaves[i];
    if(leaf.attributes.type=="page") {
      leaf.attributes.actions.push(
        {
          fn: "function(node){ window.open( node.getAttribute('pageName') + '?publish'); }",
          icon: "page_go",
          toolTip: "Publish"
        }
      );
      augmentTree(leaf.leaves);
    }
  }
}