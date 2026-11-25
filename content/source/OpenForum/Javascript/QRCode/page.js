OpenForum.includeScript("/OpenForum/Javascript/QRCode/qr-code.js");

OpenForum.init = function() {
  QRCode.drawQRCode("open-forum.onestonesoup.org","MyQRCode");
};