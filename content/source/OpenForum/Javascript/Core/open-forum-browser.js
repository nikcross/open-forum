if(!OpenForum) {
  OpenForum = {};
}

OpenForum.Browser={};

OpenForum.Browser.download = function(fileName,data){
  var hiddenElement = document.createElement('a');
  hiddenElement.href = 'data:attachment/text,' + encodeURI(data);
  hiddenElement.target = '_blank';
  hiddenElement.style.display = "none";
  hiddenElement.download = fileName;
  document.body.appendChild(hiddenElement);
  hiddenElement.click();
};

OpenForum.Browser.upload = function(callback,onError) {
   var hiddenElement = document.createElement('input');
  hiddenElement.type = "file";
  hiddenElement.style.display = "none";
  hiddenElement.onchange = function(event) {
     var reader = new FileReader();

    reader.onload = function(event) {
          if(event.target.readyState != 2) return;
          if(event.target.error) {
            if(onError) {
              onError('Error while reading file');
            } else {
              alert('Error while reading file');
            }
              return;
          }
          callback( event.target.result );
      };
      reader.readAsText(event.target.files[0]);
  };
  document.body.appendChild(hiddenElement);
  hiddenElement.click();
};

OpenForum.Browser.uploadDataUrl = function(callback,onError) {
   var hiddenElement = document.createElement('input');
  hiddenElement.type = "file";
  hiddenElement.style.display = "none";
  hiddenElement.onchange = function(event) {
     var reader = new FileReader();

    reader.onload = function(event) {
          if(event.target.readyState != 2) return;
          if(event.target.error) {
            if(onError) {
              onError('Error while reading file');
            } else {
              alert('Error while reading file');
            }
              return;
          }
          callback( event.target.result );
      };
      reader.readAsDataURL(event.target.files[0]);
  };
  document.body.appendChild(hiddenElement);
  hiddenElement.click();
};

OpenForum.Browser.overrideSave = function(fn) {
  $(document).bind('keydown', function(e) {
  if(e.ctrlKey && (e.which == 83)) {
    e.preventDefault();
    fn();
    return false;
  }
});
};