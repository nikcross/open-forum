function updateLiveField(pageName,fileName,layerId,time)
{
  loadFileToLayer( pageName,fileName,layerId );
  setTimeout( "updateLiveField('"+pageName+"','"+fileName+"','"+layerId+"',"+time+")",time*1000 );
}

function loadFileToLayer(pageName,fileName,layerId)
{
 data = fileManager.loadFile(pageName,fileName);
 document.getElementById(layerId).innerHTML = data;
}