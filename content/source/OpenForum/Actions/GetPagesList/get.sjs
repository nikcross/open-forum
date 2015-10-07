if(typeof(pageName)=="undefined")
{
	transaction.setResult(transaction.SHOW_PAGE);
}
else
{
	pages = wiki.getPages();
	
	page="";
	for(loop=0;loop<pages.length;loop++)
	{
		if(loop>0)
		{
			page = page+",";
		}
		page = page+pages[loop];	
	}
	
	transaction.sendPage(page);
}