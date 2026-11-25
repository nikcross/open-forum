/*
* Author: 
* Description: 
*/
if(!OpenForum) {
  OpenForum = {};
}
if(!OpenForum.DragAndDrop) {
  OpenForum.DragAndDrop = new function() {
    var self = this;

    var loadFile = function( file,callBack ) {
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
        var isUrl = false;
        callBack( event.target.result, isUrl, file.name );
      };
      reader.readAsDataURL( file );
    };

    self.addFileDropListener = function(elementId, callBack) {
      var element = document.getElementById(elementId);
      element.ondrop = function(ev) {
        // Prevent default behavior (Prevent file from being opened)
        ev.preventDefault();

        if (ev.dataTransfer.items) {
          // Use DataTransferItemList interface to access the file(s)
          for (var i = 0; i < ev.dataTransfer.items.length; i++) {
            // If dropped items aren't files, reject them
            if (ev.dataTransfer.items[i].kind === 'file') {
              var file = ev.dataTransfer.items[i].getAsFile();
              loadFile( file, callBack );
            } else if (ev.dataTransfer.items[i].kind === 'string') {
              if( ev.dataTransfer.items[i].type.match('^text/plain') ) {
                ev.dataTransfer.items[i].getAsString(
                  function (url) {
                    var p = unescape(url);
                    if(p.indexOf("url=")!=-1) {
                      p = p.substring( p.indexOf("url=")+4 );
                      url = p.substring(0,p.indexOf("&"));
                    }
                    var isUrl = true;
                    callBack(url,isUrl);
                  }
                );
              }
            }
          }
        } else {
          // Use DataTransfer interface to access the file(s)
          for (var i = 0; i < ev.dataTransfer.files.length; i++) {
            loadFile( ev.dataTransfer.files[i], callBack );
          }
        }
      };
      element.ondragover = function(ev) {  
        // Prevent default behavior (Prevent file from being opened)
        ev.preventDefault();
      };

    };
  };
}