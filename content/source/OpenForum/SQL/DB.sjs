/*
* Author: 
* Description: 
*/

var DB = function(alias) {
  var self = this;

  self.setAlias = function(newAlias) {
    alias = newAlias;
  };
  
  self.query = function(sql) {

    var db = js.getApi("/OpenForum/SQL");
    var queryResult = ""+db.query(alias,sql);
    queryResult = JSON.parse( "{"+queryResult+"}" );
    return queryResult;
    
  };

  self.execute = function(sql) {
    
    var db = js.getApi("/OpenForum/SQL");
    var queryResult = ""+db.execute(alias,sql);  
    queryResult = JSON.parse( "{state: "+queryResult+"}" );
    return queryResult.state;
    
  };

};