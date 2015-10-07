save = transaction.getParameter("save");
if(save==null)
{
	transaction.setResult(transaction.SHOW_PAGE);
}
else
{
  attachments = file.getAttachmentsForPage("/OpenForum/Actions");
  keys = attachments.keySet().iterator();
  
  actions = new Array();
  data = "!!Wiki Actions\n\r|Name|Description|Information\n\r";
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
      actions[actions.length] = folder;
    }
   }

  actions.sort();
  for(loop=0;loop<actions.length;loop++)
  {
    action = actions[loop];
      data+="|__"+action+"__|[{InsertPage page='/OpenForum/Actions/"+action+"' section='1'}]|[more...|/OpenForum/Actions/"+action+"]\n\r";
  }

  data = file.getAttachment("/OpenForum/UpdateActionsPage","actions-top.wiki.fragment")+data+file.getAttachment("/OpenForum/UpdateActionsPage","actions-bottom.wiki.fragment");

  if(save=="true")
  {
    file.saveAttachment("/OpenForum/Actions","page.wiki",data);
    wiki.buildPage("/OpenForum/Actions");
  }

  data = wiki.buildPage("/OpenForum/Actions/",data,true);
  transaction.sendPage(data);
}