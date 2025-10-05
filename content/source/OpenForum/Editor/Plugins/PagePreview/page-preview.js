var PagePreview = function() {
  var self = this;

  self.updateStatus = function() {
    var status = "<h4>Viewing "+pagePreview.pageToWatch+"</h4>";

    var now = new Date();
    var displayNow = now.getDisplayString();
    status += "<p>Checked for changes on "+displayNow;

    var lastModifiedDate = new Date();
    lastModifiedDate.setTime(pagePreview.lastModified);
    var displayLastModifiedDate = lastModifiedDate.getDisplayString();
    status += "</br> Changed at "+displayLastModifiedDate;

    status += "</p>";
    
    status += "<div id='QRCode'></div>";

    document.getElementById("preview-status").innerHTML = status;
    
    generateQRCode( "https://open-forum.onestonesoup.org/OpenForum/Editor/Plugins/PagePreview?pageName="+pagePreview.pageToWatch );
  };
  
  var generateQRCode = function( text ) {
      text = text.replace(/^[\s\u3000]+|[\s\u3000]+$/g, '');
      var qrValue = text;

      var qr = QRCode(10,'M');
      qr.addData(text);
      qr.make();
      var img = qr.createImgTag(10);
      document.getElementById("QRCode").innerHTML = img;
      img = document.getElementById("QRCode").children[0];
      var url = img.src.replace(/^data:image\/[^;]+/, 'data:application/octet-stream');
  };
};

PagePreview = new PagePreview();