/*
* Author: 
* Description: 
*/
var SQLEditorController = function() {
  var self = this;

  fileActions = [
    {name: "Run", description:"Run Script", fn: "SQLEditorController.runSQLScript", icon: "script_go"},
    {name: "Generate Code", description:"Generate Javascript", fn: "SQLEditorController.generateSQLCode", icon: "script_go"}
  ];

  self.historicQuery = "";
  self.dbAlias = "";
  self.dbAliases = [];
  self.sqlHistory = [];

  self.tables = [];
  self.tableView = { schema: "", name: "", columns: [], rows: 0 };

  self.indexes = [];
  
  self.sequences = [];

  self.editorConfig = {
    flavour: "SQL",
    editingFileName: "sandbox.sql",
    fileExtension: "sql",
    elementId: "sqlEditor"
  };

  self.init = function() {
    var sh = OpenForum.Storage.get( "/OpenForum/AddOn/SQL/sqlHistory" );
    if(sh!=null) {
      self.sqlHistory = JSON.parse( sh );
    }

    JSON.get("/OpenForum/AddOn/SQL","getConnections").onSuccess( 
      function(response) { 
        self.dbAliases = [];
        for(var i in response.connections) {
          self.dbAliases.push( { name: response.connections[i] } );
        }
      } 
    ).go();
  };

  self.initEditor = function() {
    var cm = CodeMirror.fromTextArea(
      document.getElementById("editor{{editorIndex}}Src"),
      { 
        theme: 'blackboard',
        indentWithTabs: true,
        smartIndent: true,
        lineNumbers: true,
        matchBrackets : true,
        autofocus: true,
        extraKeys: {"Ctrl-Space": "autocomplete"}
      }
    );

    cm.setValue("");

    sqlEditor = { 
      getCodeMirror: function() { return cm; },
      getValue: function() { return cm.getValue(); }
    };
  };

  self.setScript = function(sqlScript) {
    sqlEditor.getCodeMirror().setValue(sqlScript);
  };

  self.generatedSqlCode = "";
  self.generateSQLCode = function() {
    var code = "<xmp style='background-color: #f0f0ff; color: #0000a0; padding: 10px;'>";

    var generatedSqlCode = "//  Server side\n";
    generatedSqlCode += "//    Include library and set database alias\n";
    generatedSqlCode += "var DB = js.getObject(\"/OpenForum/AddOn/SQL\",\"DB.sjs\");\n";
    generatedSqlCode += "DB.setAlias(\""+self.dbAlias+"\");\n";

    var sqls = self.getQueries();

    for(var i=0;i<sqls.length;i++) {
      sql = sqls[i].trim();
      if(sql.length==0) continue;

      var command = sql.toLowerCase().split(" ")[0];

      generatedSqlCode += generateQueryCode(sql);
    }

    self.generatedSqlCode = generatedSqlCode;
    code += generatedSqlCode;

    code += "</xmp>";
    code+= "<a href='#' onClick='OpenForum.copyData(SQLEditorController.generatedSqlCode); alert(\"Copied to clipboard\"); return false;' class='button'>Copy to Clipboard</a>";

    document.getElementById("resultTable").innerHTML = code;
  };

  var generateQueryCode = function(sql) {
    sql = simpleFormatQuery( sql );
    sql = sql.replaceAll("\n","\" +\n \"");
    sql = "\"" + sql + "\"";

    var fields = new FluentTemplateProcessor().withTemplate(sql).getAllFields();
    var data = JSON.stringify(fields,null,4);
    data = data.substring(1,data.length-2);

    code = "\n// Query\n";
    code += "\n// add {{field name}} in query and set the field in data\n";
    code += "var sql = {\n";
    code += "    query: "+sql+",\n";
    code += "    data: {\n";
    code += data;
    code += "    }\n";
    code += "  };\n";

    var command = sql.toLowerCase().split(" ")[0];
    if(command!="select" && command.indexOf("returning")==-1) {
      code += "DB.execute( sql );\n";
    } else {
      code += "var result = DB.convertResultToObject( DB.query( sql ) );\n";
    }

    return code;
  };

  self.runSQLScript = function() {
    clearResults();

    var db = new DB(self.dbAlias);

    var sqls = self.getQueries();

    for(var i=0;i<sqls.length;i++) {
      sql = sqls[i].trim();
      if(sql.length==0) continue;

      self.sqlHistory.push( { query: sql } );
      OpenForum.Storage.set( "/OpenForum/AddOn/SQL/sqlHistory", JSON.stringify(self.sqlHistory) );

      var command = sql.toLowerCase().split(" ")[0];
      if(command.indexOf("@schema=")!=-1) {
        self.dbAlias = command.substring( 8 );
        db = new DB(self.dbAlias);
      } else if(command!="select" && command.indexOf("returning")==-1) {
        db.execute( sql,showResult,showError );
      } else {
        db.query( sql,showResultTable,showError );
      }
    }
  };

  self.appendHistoricQuery = function() {
    OpenForum.scan();
    var query = simpleFormatQuery(self.historicQuery);
    sqlEditor.getCodeMirror().setValue( sqlEditor.getValue()+"\n\n"+query+";\n" );

    $('#historyView').foundation('reveal', 'close');
  };

  var simpleFormatQuery = function(query) {
    return query.replaceAll(" where ","\n   where ")
      .replaceAll(",",",\n  ")
      .replaceAll(" from ","\n  from ")
      .replaceAll(" and ","\n    and ");
  };

  self.getQueries = function() {
    var sql = sqlEditor.getValue();
    var lines = sql.split("\n");
    sql = "";
    for(var i in lines) {
      line = lines[i];
      if(line.indexOf("\\")==0 || line.indexOf("#")==0) continue;
      sql += line + " ";
    }
    var sqls = sql.split(";");
    return sqls;
  };

  var showResultTable = function(result,sql) {
    var htmlTable = "<table>";

    htmlTable += "<thead><tr>";
    for(var i in result.table.columns) {
      var column = result.table.columns[i];
      htmlTable += "<td>"+column.columnName+" ("+column.type+")</td>";
    }
    htmlTable += "</tr></thead>";

    for(var i in result.table.rows) {
      var row = result.table.rows[i];
      htmlTable += "<tr>";
      for(var j in row) {
        var cell = row[j];
        htmlTable += "<td>"+cell+"</td>";
      }
      htmlTable += "</tr>";
    }
    htmlTable += "</table>";

    document.getElementById("resultTable").innerHTML += sql + htmlTable + "<hr/>";
  };

  var showResult = function(result,sql) {
    document.getElementById("resultTable").innerHTML += sql + "<hr/>";
  };

  var showError = function(message,error) {
    document.getElementById("resultTable").innerHTML += message+"<br/>" + "Error: "+error+"<hr/>";
  };

  var clearResults = function() {
    document.getElementById("resultTable").innerHTML = "";
  };

  self.showHistoryView = function() {
    $('#historyView').foundation('reveal', 'open');
  };

  self.showInspectionView = function() {
    var LIST_TABLES = "SELECT * FROM pg_catalog.pg_tables where schemaname = 'public'";
    var LIST_INDEXES = "SELECT * FROM pg_catalog.pg_indexes where schemaname = 'public'";
    var LIST_SEQUENCES = "SELECT * FROM pg_catalog.pg_sequences where schemaname = 'public'";

    self.tables = [];
    var db = new DB(self.dbAlias);
    db.query( LIST_TABLES,function( result, sql ) {
      self.tables = db.convertResultToObject( result );
      OpenForum.scan();
      $('#inspectionView').foundation('reveal', 'open');
    },showError );

    self.indexes = [];
    db.query( LIST_INDEXES,function( result, sql ) {
      self.indexes = db.convertResultToObject( result );
      OpenForum.scan();
      $('#inspectionView').foundation('reveal', 'open');
    },showError );
    
    self.sequences= [];
    db.query( LIST_SEQUENCES,function( result, sql ) {
      self.sequences = db.convertResultToObject( result );
      
      for(var s in self.sequences) {
         if( JSON.stringify(self.sequences[s].last_value) == "{}" ) {
          self.sequences[s].last_value = "null";
        }
      }
      
      OpenForum.scan();
      $('#inspectionView').foundation('reveal', 'open');
    },showError );
  };

  self.showTable = function( tableName ) {
    var INSPECT_TABLE = "SELECT column_name,data_type,is_nullable,column_default FROM information_schema.COLUMNS WHERE TABLE_NAME = '" +tableName+ "'";
    var COUNT_ROWS = "SELECT reltuples AS rows FROM pg_class where relname = '" +tableName+ "';";
    var db = new DB(self.dbAlias);
    self.tableView.name = tableName;
    self.tableView.schema = self.dbAlias;
    
    db.query( INSPECT_TABLE,function( result, sql ) {
      self.tableView.columns = db.convertResultToObject( result );
      for( var c in self.tableView.columns ) {
        var column = self.tableView.columns[c];
        if( JSON.stringify(column.column_default) == "{}" ) {
          column.column_default = "null";
        }
      }

    self.tableView.rows = "...";
    db.query( COUNT_ROWS,function( result, sql ) {
      self.tableView.rows = db.convertResultToObject( result )[0].rows;
      OpenForum.scan();
    },showError );
      
      OpenForum.scan();
      $('#inspectionView').foundation('reveal', 'open');
    },showError );
  };

  var addSQL = function(sql) {
    sqlEditor.getCodeMirror().setValue( sqlEditor.getCodeMirror().getValue() + "\n" + sql + ";\n" );
    $('#inspectionView').foundation('reveal', 'close');
  };
  
  self.createSelect = function() {
    var sql = "@schema=" +self.tableView.schema+ ";\nSELECT * FROM " + self.tableView.name;
    addSQL( sql );
  };
  
  self.createInsert = function() {
    var sql = "@schema=" +self.tableView.schema+ ";\nINSERT INTO " + self.tableView.name + "\n (\n";
    
    var values = "";
    var columns = "";
    
    for( var c in self.tableView.columns ) {
      if(values.length>0) {
        values += ",\n";
        columns += ",\n";
      }
      values += "# "+self.tableView.columns[c].column_name+"\n '' ";
      columns += " " +self.tableView.columns[c].column_name+ " ";
    }
    
    sql += columns + ")\n values (\n" + values + ")"; 
    
    addSQL( sql );
  };
  
  self.createTable = function() {
    var sql = "@schema=" +self.tableView.schema+ ";\nDROP TABLE " +self.tableView.name+ " IF EXISTS;\n" +
	"CREATE TABLE " +self.tableView.name+ "(\n";
    var columns = "";
    
    for( var c in self.tableView.columns ) {
      var column = self.tableView.columns[c];
      if(columns.length>0) {
        columns += ",\n";
      }
      var type = column.data_type;
      if(type=="character varying") type="varchar";
      var notNull = "";
      if(column.is_nullable==false) notNull = " NOT NULL";
      var defaultValue = "";
      if( column.column_default != "null" ) defaultValue = " DEFAULT " + column.column_default; 
      
      columns += " " +column.column_name+ " " + type + notNull + defaultValue;
    }
    
    sql += columns + "\n)"; 
    
    addSQL( sql );
  };

};

SQLEditorController = new SQLEditorController();