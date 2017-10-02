var action = transaction.getParameter("action");
if( action===null ) {
	transaction.setResult(transaction.SHOW_PAGE);
  return;
}
  action = ""+action; // Cast to String
  result = {error: "action "+action+" not recognised"};

  var processor = js.getApi("/OpenForum/Processor");
  
  function splitFields(row) {
    
    row = row.replace(/ {2}/g,"\t");
    while(row.indexOf("\t\t")!=-1) {
      row = row.replace(/\t{2}/g,"\t");
    }
    var field = row.split("\t");
    var cleanFields = [];
    for(var i in field) {
      while(field[i].charAt(0)===" ") {
        field[i] = field[i].substring(1);
      }
      cleanFields.push( field[i] );
    }
    return cleanFields;
  }

  if(action === "ps") {
    
    var data = (""+processor.createProcess("docker ps").run(true).trim()).split("\n");
    
    var containers = [];
    
    var isFirstRow=true;
    for(var i in data) {
        if(isFirstRow) {
            isFirstRow=false;
            continue;
        }
      field = splitFields(data[i]);
      // CONTAINER _D IMAGE COMMAND CREATED STATUS PORTS NAMES
      containers.push( { containerId:field[0], image:field[1], command:field[2], created:field[3], status:field[4], ports:field[5], names:field[6] } );
    }
    
    result = JSON.stringify( {result: "ok" , containers: containers} );
    
  } else  if(action === "kill") {
    
    var containerId = transaction.getParameter("containerId");
    var data = ""+processor.createProcess("docker kill "+containerId).run(true).trim();
    
    result = JSON.stringify( {result: "ok", data: data} );
    
  } else  if(action === "run") {
    
    var image = transaction.getParameter("image");
    var data = ""+processor.createProcess("docker run "+image).run(true).trim();
    
    result = JSON.stringify( {result: "ok", data: data} );
    
  } else  if(action === "log") {
    var containerId = transaction.getParameter("containerId");
    
    var queue = openForum.createQueue();
    var process = processor.createProcess("docker logs -f "+containerId);
    openForum.postMessageToQueue(queue,"docker logs for "+containerId);
    process.onMatch( ".*","(function(text) { openForum.postMessageToQueue(\""+queue+"\",text); })" ).run(false);
    
    result = JSON.stringify( {result: "ok", queue: ""+queue} );
    
  } else if(action === "images") {
    
    var data = (""+processor.createProcess("docker images").run(true).trim()).split("\n");
    
    var images = [];
    var isFirstRow=true;
    for(var i in data) {
      if(isFirstRow) {
        isFirstRow=false;
        continue;
      }
      field = splitFields(data[i]);
      // REPOSITORY TAG IMAGE ID CREATED VIRTUAL SIZE
      images.push( { repository:field[0], tag:field[1], image:field[2], id:field[3], created:field[4] , virtal_size:field[5] } );
    }
    
    result = JSON.stringify( {result: "ok", images: images} );
    
  } else {
    result = "action not recognised";
  }

  transaction.sendPage( result );