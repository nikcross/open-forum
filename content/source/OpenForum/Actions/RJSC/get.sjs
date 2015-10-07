code = transaction.getParameter("code");
if( code==null )
{
	transaction.setResult(transaction.SHOW_PAGE);
}
else
{
  code = ""+code; // Cast to String does not work. This does !
  result = eval(code);

  transaction.sendPage( result );
}