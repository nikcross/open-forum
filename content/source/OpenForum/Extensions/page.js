function createTemplate()
{
  form = document.getElementById("templateSubmitForm");
  form.newPageName.value = "/OpenForum/Extensions/"+form._newPageName.value
  form.submit();
}