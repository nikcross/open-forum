package org.onestonesoup.openforum.migration;

import java.io.File;
import java.io.IOException;

import org.onestonesoup.core.FileHelper;
import org.onestonesoup.core.data.EntityTree;
import org.onestonesoup.core.data.XmlHelper;
import org.onestonesoup.core.data.XmlHelper.XmlParseException;
import org.onestonesoup.core.file.DirectoryCrawler;
import org.onestonesoup.core.file.DirectoryCrawler.FileListener;
import org.onestonesoup.core.javascript.JSONHelper;
import org.onestonesoup.core.process.CommandLineTool;

public class XmlToJSON extends CommandLineTool implements FileListener {
	
	public static final void main(String[] args) {
		new XmlToJSON(args);
	}
	
	public XmlToJSON(String[] args) {
		super(args);
	}

	@Override
	public int getMaximumArguments() {
		return 1;
	}

	@Override
	public int getMinimumArguments() {
		return 1;
	}

	@Override
	public String getUsage() {
		return "<root directory>";
	}

	@Override
	public void process() {
		String root = getParameter(0);
		DirectoryCrawler crawler = new DirectoryCrawler();
		crawler.addFileListener(this);
		crawler.crawl(new File(root));
	}

	public void fileFound(File file) {
		if ( !file.getName().endsWith(".xml") ) {
			return;
		}
		
		System.out.println("found "+file.getAbsolutePath());
		try {
			String data = FileHelper.loadFileAsString(file);
			data = data.replaceAll("'","\"");
			EntityTree xml = XmlHelper.parseElement(data);
			String json = JSONHelper.toJSON(xml);
			
			String newFileName = file.getAbsolutePath().replace("xml", "json");
			FileHelper.saveStringToFile(json, newFileName);
			
			//file.delete();
		} catch (XmlParseException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
	}

}
