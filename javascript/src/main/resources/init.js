out.println("Initialising Library Version 0.0.6 beta");

var e;
try{ js.mount("ClipBoard","org.onestonesoup.core.ClipBoard"); } catch(e) { out.println(""+e); }
try{ js.mount("StringHelper","org.onestonesoup.core.StringHelper"); } catch(e) { out.println(""+e); }
try{ js.mount("NameHelper","org.onestonesoup.core.NameHelper"); } catch(e) { out.println(""+e); }
try{ js.mount("DirectoryHelper","org.onestonesoup.core.DirectoryHelper"); } catch(e) { out.println(""+e); }
try{ js.mount("FileHelper","org.onestonesoup.core.FileHelper"); } catch(e) { out.println(""+e); }
try{ js.mount("ImageHelper","org.onestonesoup.core.ImageHelper"); } catch(e) {} out.println(""+e);
try{ js.mount("RegExBuilder","org.onestonesoup.core.RegExBuilder"); } catch(e) { out.println(""+e); }
try{ js.mount("ZipHelper","org.onestonesoup.core.ZipHelper"); } catch(e) { out.println(""+e); }
try{ js.mount("CSVHelper","org.onestonesoup.core.data.CSVHelper"); } catch(e) { out.println(""+e); }
try{ js.mount("XmlHelper","org.onestonesoup.core.data.XmlHelper"); } catch(e) { out.println(""+e); }
try{ js.mount("Web","org.onestonesoup.javascript.helper.RemoteWebServiceAccess"); } catch(e) { out.println(""+e); }
try{ js.mount("FileChooser","org.onestonesoup.javascript.helper.FileChooser"); } catch(e) { out.println(""+e); }
try{ js.mount("Popup","org.onestonesoup.javascript.helper.Popup"); } catch(e) { out.println(""+e); }
//No longer supported in Ubuntu
//try{ js.mount("Tray","org.onestonesoup.javascript.helper.Tray"); } catch(e) { out.println(""+e); }
try{ js.mount("Process","org.onestonesoup.javascript.helper.Process"); } catch(e) { out.println(""+e); }
try{ js.mount("Computer","org.onestonesoup.javascript.helper.Computer"); } catch(e) { out.println(""+e); }
try{ js.mount("SoundHelper","org.onestonesoup.javascript.helper.SoundHelper"); } catch(e) { out.println(""+e); }

function help(obj) {
	if(typeof(obj)=="undefined") {
		js.help();
	} else {
		if( typeof(obj)=='object' ) {
			if(obj.getClass) {
				js.help(obj);
			} else {
				for(var i in obj) { out.println("  "+obj[i]); };
			}
		} else if( typeof(obj)=='function' ) {
			out.println(""+obj);
		}
	}
}

help();
out.println("Library Initialised.");
out.println("Ready");