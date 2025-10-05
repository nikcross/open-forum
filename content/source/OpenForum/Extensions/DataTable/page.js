OpenForum.init = function() {
  myTable = [
  	{ site: "BBC", url: "https://www.bbc.co.uk" },
  	{ site: "NEWS", url: "https://news.bbc.co.uk" }
  ];
  
  OpenForum.Table.closeTable( myTable );
};

function openLink( table, index ) {
  window.open( table[index].url, "newTab" );
}