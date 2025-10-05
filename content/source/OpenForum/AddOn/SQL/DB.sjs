/*
* Author: 
* Description: 
*/

var DB = function(alias) {
  var self = this;
  self.VERSION = "0.0.2 Lockdown 2.0 release";

  var parseSql = function( sqlObject ) {
    if( sqlObject.action == "insert" ) {
      return parseInsert( sqlObject, true );
    } else if( sqlObject.action == "select" ) {
      return parseSelect( sqlObject );
    } else if( sqlObject.action == "update" ) {
      return parseUpdate( sqlObject );
    } else if( sqlObject.action == "upsert" ) {
      return parseUpsert( sqlObject );
    } else if( sqlObject.action == "delete" ) {
      return parseDelete( sqlObject );
    } else if( sqlObject.query ) {
      return parseQuery( sqlObject );
    } else {
      throw "Unrecognised SQL action " + sqlObject.action;
    }
  };

  var parseInsert = function( sqlObject, addReturn ) {
    var names = "";
    var values = "";
    for( var i in sqlObject.data ) {
      if(names.length>0) names+= " ,";
      names += i;
      if(values.length>0) values+= " ,";
      //Inserted data should be sanitised here
      var value = (""+sqlObject.data[i]).replace(/'/g,"''");
      values += "'" + value + "'";
    }
    var SQL = "insert into " + sqlObject.table + " (" + names + ") values (" + values + ")";
    if( addReturn && sqlObject.returnColumn ) SQL += " returning " + sqlObject.returnColumn;

    return SQL;
  };

  var parseUpdate = function( sqlObject ) {
    var where = parseClause( sqlObject );
    if(where == "" && !sqlObject.allRows) throw "Update must include a where clause unless allRows is set true";

    var set = "";
    for( var i in sqlObject.data ) {
      if(set.length>0) set+= " ,";
      set += i;

      //Inserted data should be sanitised here
      var value = (""+sqlObject.data[i]).replace(/'/g,"''");
      set += " = '" + value + "'";
    }

    if(set == "") throw "Update must include a some data to set";

    var SQL = "update " + sqlObject.table + " set " + set + where;
    return SQL;
  };

  var parseUpsert = function( sqlObject ) {
    var unique = "";
    for(var i in sqlObject.uniqueColumns) {
      if(unique.length>0) unique += ", ";
      unique += sqlObject.uniqueColumns[i];
    }
    if(unique == "") throw "Upsert must include a list of uniqueColumns";

    var insert = parseInsert( sqlObject, false );
	sqlObject.allRows = true;
    var update = parseUpdate( sqlObject );
    update = update.replace(sqlObject.table,"");

    var SQL = insert + " ON CONFLICT (" + unique + ") DO " + update;
    
    if( sqlObject.returnColumn ) SQL += " returning " + sqlObject.returnColumn;
    
    return SQL;
  };

  var parseDelete = function( sqlObject ) {
    var where = parseClause( sqlObject );
    if(where == "" && !sqlObject.allRows) throw "Delete must include a where clause unless allRows is set true";

    var SQL = "delete from " + sqlObject.table + where;
    return SQL;
  };

  var parseSelect = function( sqlObject ) {
    var columns = "";
    if( !sqlObject.columns ) {
      columns = "*";
    } else {
      for( var i in sqlObject.columns ) {
        if( columns.length>0 ) columns += ",";
        columns += sqlObject.columns[i];
      }
    }

    var where = parseClause( sqlObject );

    return "select " + columns + " from " + sqlObject.table + where;
  };

  var parseClause = function( sqlObject ) {
    var where = "";
    if( sqlObject.where ) {

      for( var i in sqlObject.where ) {

        if(where.length>0) where+= " and ";
        where += i;

        var value = (""+sqlObject.where[i]).replace(/'/g,"''");
        var matchFn = "=";
        where += " "+ matchFn + " '" + value + "'";

      }

      where = " where " + where + " ";
    }
    return where;
  };

  var parseQuery = function( sqlObject ) {
    var sql = "" + sqlObject.query;
    for( var i in sqlObject.data ) {
      //Inserted data should be sanitised here
      var value = (""+sqlObject.data[i]).replace(/'/g,"''");
      sql = sql.replace( new RegExp("{{"+i+"}}","g"), value );
    }
    return sql;
  };

  self.setAlias = function(newAlias) {
    alias = newAlias;
  };

  self.getConnections = function() {
    var db = js.getApi("/OpenForum/AddOn/SQL");

    return db.getConnections();
  };

  self.getUserName = function() {
    var db = js.getApi("/OpenForum/AddOn/SQL");

    return db.getDatabaseMetaData(alias).getUserName();
  };

  self.run = function(sqlObject) {
    var sql = parseSql( sqlObject );
    try {
      if( sqlObject.action == "select" || sqlObject.returnColumn || (sqlObject.query && sqlObject.query.toLowerCase().indexOf("select")==0) ) {
        var result = self.query( sql );
        return self.convertResultToObject( result );
      } else {
        self.execute( sql );
      } 
    } catch (e) {
      try {
        throw e + " DB Alias: "+alias+" SQL:" + sql + " sqlObject:" + JSON.stringify( sqlObject );
      } catch (e) {
        throw e;
      }
    }
  };

  self.query = function(sql) {

    if(typeof sql == "object") {
      sql = parseSql( sql );
    }

    var db = js.getApi("/OpenForum/AddOn/SQL");
    try{
      var queryResult = ""+db.query(alias,sql);
      queryResult = JSON.parse( "{"+queryResult+"}" );
      return queryResult;
    } catch(e) {
      throw e + " DB: "+alias+" SQL:" + sql;
    }
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

  self.execute = function(sql) {

    if(typeof sql == "object") {
      if(sql.returnColumn) {
        return self.query(sql);
      }
      sql = parseSql( sql );
    }

    var db = js.getApi("/OpenForum/AddOn/SQL");
    try{
      var queryResult = ""+db.execute(alias,sql);  
      queryResult = JSON.parse( "{state: "+queryResult+"}" );
      return queryResult.state;
    } catch(e) {
      throw e + " DB: "+alias+" SQL:" + sql;
    }
  };

};