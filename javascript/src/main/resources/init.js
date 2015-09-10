out.println("Initialising Library Version 0.0.5 beta");

try{ js.mount("ClipBoard","org.onestonesoup.core.ClipBoard"); } catch(e) {}
try{ js.mount("StringHelper","org.onestonesoup.core.StringHelper"); } catch(e) {}
try{ js.mount("NameHelper","org.onestonesoup.core.NameHelper"); } catch(e) {}
try{ js.mount("DirectoryHelper","org.onestonesoup.core.DirectoryHelper"); } catch(e) {}
try{ js.mount("FileHelper","org.onestonesoup.core.FileHelper"); } catch(e) {}
try{ js.mount("ImageHelper","org.onestonesoup.core.ImageHelper"); } catch(e) {}
try{ js.mount("JSONHelper","org.onestonesoup.core.javascript.JSONHelper"); } catch(e) {}
try{ js.mount("RegExBuilder","org.onestonesoup.core.RegExBuilder"); } catch(e) {}
try{ js.mount("ZipHelper","org.onestonesoup.core.ZipHelper"); } catch(e) {}
try{ js.mount("CSVHelper","org.onestonesoup.core.data.CSVHelper"); } catch(e) {}
try{ js.mount("XmlHelper","org.onestonesoup.core.data.XmlHelper"); } catch(e) {}
try{ js.mount("Web","org.onestonesoup.javascript.helper.RemoteWebServiceAccess"); } catch(e) {}
try{ js.mount("FileChooser","org.onestonesoup.javascript.helper.FileChooser"); } catch(e) {}
try{ js.mount("Popup","org.onestonesoup.javascript.helper.Popup"); } catch(e) {}
try{ js.mount("Tray","org.onestonesoup.javascript.helper.Tray"); } catch(e) {}
try{ js.mount("Process","org.onestonesoup.javascript.helper.Process"); } catch(e) {}
try{ js.mount("Computer","org.onestonesoup.javascript.helper.Computer"); } catch(e) {}
try{ js.mount("SoundHelper","org.onestonesoup.javascript.helper.SoundHelper"); } catch(e) {}

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