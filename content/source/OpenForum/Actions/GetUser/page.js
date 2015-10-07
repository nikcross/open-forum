includeInitFunction( "getUser();" );

function getUser()
{
 user = ajax.doGet("/OpenForum/Actions/GetUser","pageName=N/A");
 document.getElementById("userLayer").innerHTML = "Logged in as "+user;
}
