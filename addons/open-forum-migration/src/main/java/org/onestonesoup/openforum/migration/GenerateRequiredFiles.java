package org.onestonesoup.openforum.migration;

import java.io.File;
import java.io.IOException;

import org.onestonesoup.core.FileHelper;
import org.onestonesoup.core.file.DirectoryCrawler;
import org.onestonesoup.core.file.DirectoryCrawler.DirectoryListener;
import org.onestonesoup.core.file.DirectoryCrawler.FileListener;
import org.onestonesoup.core.process.CommandLineTool;

public class GenerateRequiredFiles extends CommandLineTool implements FileListener,DirectoryListener {
	
	public static final void main(String[] args) {
		new GenerateRequiredFiles(args);
	}
	
	public GenerateRequiredFiles(String[] args) {
		super(args);
	}

	public void fileFound(File file) {
		System.out.println("checking "+file);
			if(file.getName().equals("page.wiki")) {
				File newFile = new File(file.getParentFile().getAbsolutePath()+"/page.content");
				file.renameTo(newFile);
				System.out.println("copied "+file+" to "+newFile);
			}
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
		crawler.addDirectoryListener(this);
		crawler.crawl(new File(root));
	}

	public void directoryFound(File file) {
		System.out.println("checking "+file);
		
		File dataFile = new File( file.getAbsolutePath()+"/data.json" );
		if(!dataFile.exists()) {
			try {
				FileHelper.saveStringToFile("{}", dataFile);
				System.out.println("created "+dataFile);
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
		
		File headerFile = new File( file.getAbsolutePath()+"/header.html.template" );
		File footerFile = new File( file.getAbsolutePath()+"/footer.html.template" );
		
		if(headerFile.exists() && footerFile.exists()) {
			
			try {
				String header = FileHelper.loadFileAsString(headerFile);
				String footer = FileHelper.loadFileAsString(footerFile);

				File pageTemplate = new File( file.getAbsolutePath()+"/page.html.template" );
				FileHelper.saveStringToFile(header + "\n<!-- Start Content -->&content;<!-- End Content -->" + footer, pageTemplate);
				
				System.out.println("create "+pageTemplate);
				
				headerFile.delete();
				footerFile.delete();
				
				System.out.println("deleted "+headerFile);
				System.out.println("deleted "+footerFile);
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
	}

}
