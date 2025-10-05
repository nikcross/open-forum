// Version: {{version}}
try {
  var FluentTemplateProcessor = js.getObject( "/OpenForum/Javascript/FluentTemplateProcessor", "FluentTemplateProcessor.js" );

  var tableName = extension.getAttribute("tableName");

  var fileName = extension.getAttribute("fileName");

  var rowTemplateFileName = extension.getAttribute("rowTemplateFileName");
  var rowTemplatePageName = rowTemplateFileName.substring( 0, rowTemplateFileName.lastIndexOf("/") );
  var templateFileName = rowTemplateFileName.substring( rowTemplateFileName.lastIndexOf("/")+1 );

  var content = "" + file.getAttachment("/OpenForum/Javascript/Application/TableEditor","table-editor.html.template");
  var fluentTemplate = FluentTemplateProcessor.withTemplate( content );
  content = fluentTemplate.getSections()[0]; //table
  content += fluentTemplate.getSections()[1]; //script
  
  var row = JSON.parse( "" + file.getAttachment( rowTemplatePageName,templateFileName ) );
  var columnTitles = "";
  var columnNames = "";
  
  for(var r in row ) {
    var columnName = r;
    var columnTitle = columnName.substring(0,1).toUpperCase() + columnName.substring(1);
    
    columnNames += fluentTemplate.getSections()[2].replace(/{{columnName}}/g,columnName);
    
    columnTitles += fluentTemplate.getSections()[3].replace(/{{columnTitle}}/g,columnTitle);
  }

  content = content.replace(/{{tableName}}/g, "" + tableName);
  content = content.replace(/{{fileName}}/g, "" + fileName);
  content = content.replace(/{{columnNames}}/g, "" + columnNames).replace(/{{tableName}}/g, "" + tableName);
  content = content.replace(/{{columnTitles}}/g, "" + columnTitles);

  content = content.replace(/{{rowTemplateFileName}}/g, "" + rowTemplateFileName);

  return content;
} catch(e) {
  return "" + e;
}
