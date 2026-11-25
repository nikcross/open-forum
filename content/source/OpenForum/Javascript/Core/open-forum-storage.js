if(!OpenForum) {
  OpenForum = {};
}
OpenForum.Storage = {};

OpenForum.Storage.requestAccess = function() {
  document.requestStorageAccess();
};

OpenForum.Storage.get = function(key) {
  try{
    return localStorage.getItem(key);
  } catch(e) {
    console.log(e);
  }
};

OpenForum.Storage.set = function(key,value) {
  try{
    localStorage.setItem(key,value);
  } catch(e) {
    console.log(e);
  }
};

OpenForum.Storage.find = function(regex) {
  try{
    var found = [];
    for(var i in localStorage) {
      if( i.match(regex)) {
        found.push( {key: i, value: localStorage[i]} );
      }
    }
    return found;
  } catch(e) {
    console.log(e);
  }
};