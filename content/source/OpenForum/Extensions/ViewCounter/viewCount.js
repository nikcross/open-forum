includeInitFunction( "updateViewCount();" );

function updateViewCount()
{
  count = loadFile("/OpenForum/Actions/","IncrementAttachment?pageName="+pageName+"&fileName=viewCount.txt");

  document.getElementById("viewCounter").innerHTML = "This page has been viewed "+count+" times.";
}