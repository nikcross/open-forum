/*
* Author: 
* Description: 
*/

var DB = function(alias) {
  var self = this;

  self.query = function(sql,callBack) {
    JSON.get("/OpenForum/SQL","query","SQL="+sql+"&db="+alias).onSuccess(
      function(result) {
        callBack(result.queryResult);
      }
    ).go();
  };

  self.execute = function(sql,callBack) {
      JSON.get("/OpenForum/SQL","query","SQL="+sql+"&db="+alias).onSuccess(
      function(result) {
        callBack(result.queryResult.state);
      }
    ).go();
  };

};