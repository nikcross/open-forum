if(typeof(pageName)=="undefined")
{
       transaction.setResult(transaction.SHOW_PAGE);
}
else
{
       transaction.userCanPerformAction(pageName,"update",true);

       timeStamp = wiki.getDateTimeStamp();
       pageName = pageName+"/blog/"+timeStamp;

       file.saveAttachment(
pageName,"edit-form.html.template.link","/OpenForum/Page/edit-form.html.template"
);

       page = wiki.buildEditPage(pageName);
       transaction.sendPage(page);
}
