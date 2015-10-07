//Take base64 image and convert to image file

dec = Packages.javax.xml.bind.DatatypeConverter;

data = transaction.getParameter("data");
fileName = transaction.getParameter("fileName");
pageName = transaction.getParameter("pageName");

var outStream = file.getAttachmentOutputStream(pageName,fileName);
outStream.write( dec.parseBase64Binary(data) );
outStream.flush();
outStream.close();

var result = {result: "ok", message: "Saved "+pageName+"/"+fileName};

transaction.sendPage( JSON.stringify(result) );