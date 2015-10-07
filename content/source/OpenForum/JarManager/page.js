function createTemplate()
{
  form = document.getElementById("templateSubmitForm");
  form.newPageName.value = "/OpenForum/JarManager/"+form._newPageName.value
  form.submit();
}