data = file.getAttachment("/OpenForum/Extensions/ViewCounter","viewCount.js");
return "<DIV id='viewCounter'>--</DIV><script>pageName='"+pageName+"';\n"+data+"</script>";