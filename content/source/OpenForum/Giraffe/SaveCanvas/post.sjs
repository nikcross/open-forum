//Take base64 image and convert to image file

try{
  dec = Packages.javax.xml.bind.DatatypeConverter;

  data = transaction.getParameter("data");
  fileName = transaction.getParameter("fileName");
  pageName = transaction.getParameter("pageName");

  var outStream = file.getAttachmentOutputStream(pageName,fileName);
  outStream.write( dec.parseBase64Binary(data) );
  outStream.flush();
  outStream.close();


  transaction.sendJSON( JSON.stringiify({result: "ok", message: "Saved "+pageName+"/"+fileName}));
} catch(e) {
  transaction.sendJSON( JSON.stringiify({result: "error", message: ""+e}));
}