var action = transaction.getParameter("action");
if(action===null) {
	transaction.setResult(transaction.SHOW_PAGE);
	return;
}
action = ""+action;

function createLeaves(pageName) {
    var data = "";
    var isFirst = true;
  
  try{
    var list = file.getAttachmentsForPage( pageName );
    var iterator= list.keySet().iterator();
    var keys = [];
    while(iterator.hasNext()) {
      keys.push( ""+iterator.next() );
    }
    keys.sort();
    
    for(var i in keys) {
        var key = keys[i];
    	if(key.charAt(0)=='+') {
      		continue;
    	}
      	if(isFirst) {
			isFirst = false;
        } else {
           data += ", ";
        }
      data += createFileLeaf( pageName, key );
    }
    
    for(var i in keys) {
        var key = keys[i];
      
          if(key.charAt(0)!='+' || key=="+history") {
              continue;
          } else if(key.indexOf("\"")!=-1 || key.indexOf("'")!=-1) {
                continue;
          } else {
            
            if(isFirst) {
              isFirst = false;
            } else {
              data += ", ";
            }

            var item = key.substring(1);
            data += createPageLeaf( pageName + "/" + item );
        }
    }
  } catch (e) { }
   return data; 
}

function createFileLeaf(pageName,fileName) {
    pageName = pageName.replace(/\/\//g,"/");
    var name = fileName;
    var extension = fileName.substring(fileName.lastIndexOf("."));
  
	var data = "{\"name\": \"" + name + "\", ";
	data += "\"attributes\": {";
  
    data += "\"actions\": [";
  
  if(extension===".link") {
    data += "new Action( function(node){ window.location = '/OpenForum/Actions/ForkLink?pageName=' + node.getAttribute('pageName') + '&fileName=' + node.getAttribute('fileName'); } , \"arrow_divide\" ), ";
  } else {
    data += "new Action( function(node){ window.location = '/OpenForum/Editor?pageName=' + node.getAttribute('pageName') + '&fileName=' + node.getAttribute('fileName'); } , \"pencil\" ), ";
  }
  
    data += "new Action( function(node){ window.location = '/OpenForum/Actions/Delete?pageName='+node.getAttribute('pageName') + '&fileName=' + node.getAttribute('fileName'); } , \"cancel\" )";
    data += "], ";

    data += "\"type\": \"file\", ";
    data += "\"pageName\": \"" + pageName + "\", ";
    data += "\"fileName\": \"" + fileName + "\", ";
    data += "\"link\": \"" + pageName + "/" + fileName + "\", ";
    data += "\"icon\": \"attach\" ";
  
            data += "} ,";
            data += "\"leaves\": []";
            data += "}";
  			return data;
}

function createPageLeaf(pageName) {
  	pageName = pageName.replace(/\/\//g,"/");
  var name = pageName;
  if(name.indexOf("/")!=-1) {
    name = name.substring(name.lastIndexOf("/")+1);
  }
  
            var data = "{\"name\": \"" + name + "\", ";
    		data += "\"attributes\": {";
  
    data += "\"actions\": [";
    data += "new Action( function(node){ window.location = '/OpenForum/Editor?pageName='+node.getAttribute('pageName'); } , \"layout_edit\" ), ";
    data += "new Action( function(node){ window.location = '/OpenForum/Actions/Delete?pageName='+node.getAttribute('pageName'); } , \"cancel\" )";
    data += "], ";

    data += "\"type\": \"page\", ";
    data += "\"pageName\": \"" + pageName + "\", ";
    data += "\"link\": \"" + pageName + "\", ";
    data += "\"icon\": \"page\" ";
  
            data += "} ,";
            data += "\"leaves\": [";
  			data += createLeaves( pageName );
  			data += "]";
            data += "}";
  			return data;
}

if(action==="getPageTree") {
  var targetPage = ""+transaction.getParameter("pageName");
  list = file.getAttachmentsForPage( targetPage );
  if(targetPage.charAt(0)!='/')
  {
    targetPage = "/"+targetPage;
  }
  
  transaction.sendPage( createPageLeaf(targetPage) );
}