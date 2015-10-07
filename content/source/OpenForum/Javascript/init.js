var version = "1.0";

libraries = new Array();
libraryVersion = new Array();
styles = new Array();
initFunctions = new Array();

var wildcard = "*";
libraryVersion["\OpenForum\init.js"] = version;

function init()
{
	for(loopFunctions=0;loopFunctions<initFunctions.length;loopFunctions++)
	{
		//alert("initFunction "+loopFunctions+" = "+initFunctions[loopFunctions]);
try{
		eval(initFunctions[loopFunctions]);
}
catch(e)
{
  alert("Error "+e+" running init function "+initFunctions[loopFunctions]+" line:"+e.lineNumber);
}
	}
}

function includeInitFunction( jsCode )
{
	initFunctions[initFunctions.length] = jsCode;
}

function includeLibrary(libraryUrl)
{
	if(libraries[libraryUrl]!=null)
	{
		return;
	}
	version="?";
	document.write("<script type=\"text/javascript\" src=\""+libraryUrl+"\"></script>");
	libraryVersion[libraryUrl] = version;
}

function exists(objectName)
{
	if(eval("typeof("+objectName+")=='undefined'"))
	{
		return false;
	}
	else
	{
		return true;
	}
}

function getParameter( name )
{
  name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
  var regexS = "[\\?&]"+name+"=([^&#]*)";
  var regex = new RegExp( regexS );
  var results = regex.exec( window.location.href );
  if( results == null )
    return "";
  else
    return results[1];
}

function getLibraryVersion(libraryUrl)
{
	return 	libraryVersion[libraryUrl];
}

function setLibraryVersion(libraryUrl,version)
{
	libraryVersion[libraryUrl]=version;
}

function unload()
{
}