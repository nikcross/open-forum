parts = pageName.split("/");
data = "";
path = "";

for(loop=0;loop<parts.length;loop++)
{
  path+="/"+parts[loop]
  data+=" &gt;&gt; <a href=\""+path+"\">"+parts[loop]+"</a>";
}

return data;