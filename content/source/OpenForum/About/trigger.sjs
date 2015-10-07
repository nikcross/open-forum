if(trigger.isHourPeriod()==false)
{
  return;
}

newData = external.getData( "http://www.onestonesoup.org/ProjectOpenForum/Release/current-version.txt" );
currentData = file.getAttachment(pageName,"current-version.txt");

if(newData!=currentData)
{
  file.saveAttachment( pageName,"version-check.txt",newData );
}