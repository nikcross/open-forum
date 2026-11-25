OpenForum.getUserReference = function() {
  var userReference = OpenForum.Storage.get("user.reference");
  if(userReference==null) {
    userReference = "User:"+(""+Math.random()).replace(".","")+":"+new Date().getTime();
    OpenForum.Storage.set("user.reference",userReference);
  }
  return userReference;
};