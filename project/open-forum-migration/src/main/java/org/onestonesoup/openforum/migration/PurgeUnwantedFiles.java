package org.onestonesoup.openforum.migration;

import java.io.File;
import java.io.IOException;

import org.onestonesoup.core.FileHelper;
import org.onestonesoup.core.file.DirectoryCrawler;
import org.onestonesoup.core.file.DirectoryCrawler.DirectoryListener;
import org.onestonesoup.core.file.DirectoryCrawler.FileListener;
import org.onestonesoup.core.process.CommandLineTool;

public class PurgeUnwantedFiles extends CommandLineTool implements FileListener,DirectoryListener{
	
	public static final void main(String[] args) {
		new PurgeUnwantedFiles(args);
	}
	
	public PurgeUnwantedFiles(String[] args) {
		super(args);
	}

	String[] fileNames;
	
	@Override
	public int getMaximumArguments() {
		return 2;
	}

	@Override
	public int getMinimumArguments() {
		return 2;
	}

	@Override
	public String getUsage() {
		return "<root directory> <files-list-file>";
	}

	@Override
	public void process() {
		String root = new File(getParameter(0)).getAbsolutePath();
		if(!root.endsWith("/")) {
			root+="/";
		}
		String data;
		try {
			data = FileHelper.loadFileAsString(new File(getParameter(1)).getAbsolutePath());
			fileNames = data.split("\n");
			for(int i=0;i<fileNames.length;i++) {
				fileNames[i] = root+fileNames[i];
			}
			
			System.out.println("Crawling "+root);
			DirectoryCrawler crawler = new DirectoryCrawler();
			crawler.addFileListener(this);
			crawler.addDirectoryListener(this);
			crawler.crawl(new File(root));
			
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	public void fileFound(File file) {
		for(String fileName: fileNames) {
			System.out.println("Testing "+file.getAbsolutePath());
			if(!file.getAbsolutePath().matches(fileName)) {
				continue;
			} else {
				System.out.println("Matched "+fileName+" "+file);
				if(file.delete()) {
					System.out.println("Deleted "+file.getAbsolutePath());
				} else {
					System.out.println("FAILED to delete "+file.getAbsolutePath());
				}
			}
		}
	}

	public void directoryFound(File directory) {
		fileFound(directory);
	}
}
