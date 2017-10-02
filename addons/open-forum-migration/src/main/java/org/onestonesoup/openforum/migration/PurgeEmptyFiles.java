package org.onestonesoup.openforum.migration;

import java.io.File;

import org.onestonesoup.core.file.DirectoryCrawler;
import org.onestonesoup.core.file.DirectoryCrawler.FileListener;
import org.onestonesoup.core.process.CommandLineTool;

public class PurgeEmptyFiles extends CommandLineTool implements FileListener {
	
	public static final void main(String[] args) {
		new PurgeEmptyFiles(args);
	}
	
	public PurgeEmptyFiles(String[] args) {
		super(args);
	}

	public void fileFound(File file) {
		if(file.isFile() && file.length()==0) {
			if(file.delete()) {
				System.out.println("Deleted "+file.getAbsolutePath());
			} else {
				System.out.println("FAILED to delete "+file.getAbsolutePath());
			}
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
		crawler.crawl(new File(root));
	}

}
