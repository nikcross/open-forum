/*
* Author: 
* Description: 
*/

var DB = function(alias) {
  var self = this;
  var busy = false;

  self.query = function(sql,callBack,errorCallBack) {
    if(busy) {
      setTimeout( function() { self.query(sql,callBack,errorCallBack); },1000 );
      return;
    }

    sql = sql.replaceAll("%","%25");
    JSON.get("/OpenForum/AddOn/SQL","query","SQL="+sql+"&db="+alias).onSuccess(
      function(result) {
        if(result.result=="dbError") {
          errorCallBack(result.message,result.error);
          busy = false;
          return;
        }
        callBack(result.queryResult, result.sql);
        busy = false;
      }
    ).go();
    busy = true;
  };

  self.execute = function(sql,callBack,errorCallBack) {
    if(busy) {
      setTimeout( function() { self.execute(sql,callBack,errorCallBack); },1000 );
      return;
    }

    sql = sql.replaceAll("%","%25");
    JSON.get("/OpenForum/AddOn/SQL","query","SQL="+sql+"&db="+alias).onSuccess(
      function(result) {
        if(result.result=="dbError") {
          errorCallBack(result.message,result.error);
          busy = false;
          return;
        }
        callBack(result.queryResult.state, result.sql);
        busy = false;
      }
    ).go();
    busy = true;
  };

  self.convertResultToObject = function(result) {
    var output = [];
    var columns = [];
    for(var i in result.table.columns) {
      columns.push( result.table.columns[i].columnName );
    }

    for(var i in result.table.rows) {
      var row = result.table.rows[i];
      var item = {};
      var c = 0;
      for(var j in row) {
        item[columns[c]] = row[j];
        c++;
      }
      output.push( item );
    }
    return output;
  };
};