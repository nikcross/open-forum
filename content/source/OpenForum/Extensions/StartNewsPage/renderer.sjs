var title = extension.getAttribute("title");

if(title!=null)
{
 data =  "<h3>"+title+"</h3>"
 data += "<table width=\"100%\" cellspacing=\"10\" style=\"border: solid; border-width: 1px; border-color: #A0A0A0; font: 10pt tahoma;\"><tr>";
return data;
}
else
{
 return "Invalid News Page. Missing title attribute.";
}