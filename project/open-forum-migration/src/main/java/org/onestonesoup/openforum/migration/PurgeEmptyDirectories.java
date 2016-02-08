package org.onestonesoup.openforum.migration;

import java.io.File;

import org.onestonesoup.core.file.DirectoryCrawler;
import org.onestonesoup.core.file.DirectoryCrawler.DirectoryListener;
import org.onestonesoup.core.file.DirectoryCrawler.FileListener;
import org.onestonesoup.core.process.CommandLineTool;

public class PurgeEmptyDirectories extends CommandLineTool implements DirectoryListener {
	
	public static final void main(String[] args) {
		new PurgeEmptyDirectories(args);
	}
	
	public PurgeEmptyDirectories(String[] args) {
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
		
		new PurgeUnwantedFiles(new String[]{root,".*/history/.*:.*/history"});
		
		DirectoryCrawler crawler = new DirectoryCrawler();
		crawler.addDirectoryListener(this);
		crawler.crawl(new File(root));
	}

	public void directoryFound(File directory) {
		//Check in case this method has deleted directory already
		if(directory.exists()==false) return;
		
		// Delete up tree
		File[] files = directory.listFiles();
		for(File file: files) {
			if(file.isDirectory()) {
				directoryFound(file);
			}
		}

		//Delete page.html etc. if only files as this is generated as a change in error due to timestamp
		boolean hasNonGeneratedFile = false;
		for(File file: files) {
			String fileName  = file.getName();
			if(fileName.equals("page.html") || fileName.equals("page.html.fragment") || file.isDirectory() ) {
				continue;
			} else {
				hasNonGeneratedFile=true;
				break;
			}
		}
		if(hasNonGeneratedFile) {
			return;
		} else {
			for(File file: files) {
				String fileName  = file.getName();
				if(fileName.equals("page.html") || fileName.equals("page.html.fragment") ) {
					System.out.println("Deleting generated file "+file);
					boolean result = file.delete();
					if(result==false) {
						System.out.println("FAILED to delete file "+file);
					}
				}
			}
		}
		
		if(directory.listFiles().length==0) {
			System.out.println("deleting empty directory "+directory);
			boolean result = directory.delete();
			if(result==false) {
				System.out.println("FAILED to delete empty directory "+directory);
			}
		} else {
			System.out.println("NOT deleting directory "+directory);
		}
	}

}
