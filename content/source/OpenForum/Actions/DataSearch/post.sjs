transaction.getPostData();

listPage = transaction.getPostParameter("_listPage");
asCsv = transaction.getPostParameter("_asCSV");		

if(asCsv!=null & asCsv=="on")
{
	page = transaction.buildDataSearchResultTable(listPage);
	transaction.sendFile( page,"search-result.csv" );
}
else
{
	page = transaction.buildDataSearchResultPage(listPage);
	transaction.sendPage( page );
}