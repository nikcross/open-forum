if(!OpenForum) {
  OpenForum = {};
}
OpenForum.Storage = {};

OpenForum.Storage.get = function(key) {
  return localStorage.getItem(key);
};

OpenForum.Storage.set = function(key,value) {
  localStorage.setItem(key,value);
};

OpenForum.Storage.find = function(regex) {
  var found = [];
  for(var i in localStorage) {
    if( i.match(regex)) {
      found.push( {key: i, value: localStorage[i]} );
    }
  }
  return found;
};