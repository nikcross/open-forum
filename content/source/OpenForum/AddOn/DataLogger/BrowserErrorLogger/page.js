/*
* Author: 
*/

var errorHeatList = [];

var platformList = [];

var siteList = [];

OpenForum.init = function() {
  OpenForum.setInterval(updateHeatList,30000,true,false,false);
};

function updateHeatList() {
  errorHeatList = OpenForum.loadJSON("/OpenForum/AddOn/DataLogger/BrowserErrorLogger/error-heat-list.json", function(response) {

    platformList = [];
    siteList = [];
    
    errorHeatList = response;
    for(var i in errorHeatList) {
      var row = errorHeatList[i];
      var parts = row.key.split("\t");
      row.site = parts[0];
      row.page = parts[1];
      row.error = parts[2];
      row.lastOccured_VIEW = new Date(row.lastTime).toString();
      if(row.firstTime==0) {
         row.firstOccured_VIEW = "--";
      } else {
      	row.firstOccured_VIEW = new Date(row.firstTime).toString();
      }
    }
    errorHeatList.sort( function( a,b ) { 
      if( a.heat > b.heat ) return -1;
      else if( a.heat < b.heat ) return 1;
      else return 0;
    } );

    var list = {};
    for(var i in errorHeatList) {
      var row = errorHeatList[i];
      if( list[ row.error + ":" + row.site ] ) {
        list[ row.error + ":" + row.site ].heat += row.heat;
        list[ row.error + ":" + row.site ].count ++;
      } else {
        list[ row.error + ":" + row.site ] = { site: row.site, error: row.error, heat: row.heat, count: 1 };
      }
    }
    for(var i in list) {
      if( list[i].count>1 ) {
        siteList.push( list[i] );
      }
    }

    list = {};
    for(var i in errorHeatList) {
      var row = errorHeatList[i];
      if( list[ row.error ] ) {
        list[ row.error ].heat += row.heat;
        list[ row.error ].count ++;
      } else {
        list[ row.error ] = { error: row.error, heat: row.heat, count: 1 };
      }
    }
    for(var i in list) {
      if( list[i].count>1 ) {
        platformList.push( list[i] );
      }
    }
  }, true);
};
