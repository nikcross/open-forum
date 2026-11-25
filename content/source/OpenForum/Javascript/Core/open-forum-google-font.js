/*
* Author: 
* Description: 
*/
OpenForum.loadGoogleFont = function(fontFamily,weight) {
  if(!weight) weight = 400;
  OpenForum.loadCSS( "https://fonts.googleapis.com/css2?family="+fontFamily+":wght@"+weight );
};