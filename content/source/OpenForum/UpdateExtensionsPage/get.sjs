save = transaction.getParameter("save");
if(save==null)
{
	transaction.setResult(transaction.SHOW_PAGE);
}
else
{
  attachments = file.getAttachmentsForPage("/OpenForum/Extensions");
  keys = attachments.keySet().iterator();

  extensions = new Array();
  data = "!!Wiki Markup Extensions\n\r|Name|Description|Information\n\r";
  while(keys.hasNext())
  {
    attachment = new String(keys.next());
    if(attachment.charAt(0)=='+')
    {
      folder = attachment.substring(1);
      if(folder=="history")
      {
        continue;
      }
      extensions[extensions.length] = folder;
    }
   }

  extensions.sort();

  for(loop=0;loop<extensions.length;loop++)
  {
    extension = extensions[loop];
      data+="|__"+extension+"__|[{InsertPage page='/OpenForum/Extensions/"+extension+"' section='1'}]|[more...|/OpenForum/Extensions/"+extension+"]\n\r";
  }

  data = file.getAttachment("/OpenForum/UpdateExtensionsPage","extensions-top.wiki.fragment")+data+file.getAttachment("/OpenForum/UpdateExtensionsPage","extensions-bottom.wiki.fragment");

  if(save=="true")
  {
    file.saveAttachment("/OpenForum/Extensions","page.wiki",data);
    wiki.buildPage("/OpenForum/Extensions");
  }

  data = wiki.buildPage("/OpenForum/Extensions/",data,true);
  transaction.sendPage(data);
}