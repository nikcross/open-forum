if(typeof(pageName)=="undefined")
{
	transaction.setResult(transaction.SHOW_PAGE);
}
else
{
  queueName = wiki.createQueue();

  transaction.sendPage(queueName);
}