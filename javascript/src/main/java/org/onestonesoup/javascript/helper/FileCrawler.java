package org.onestonesoup.javascript.helper;

public class FileCrawler {

	public class FileCrawlerBuilder {
		public void onMatch(String matcher,String function) {
			
		}
		public void onEnd(String function) {
			
		}
		public void crawl(String directory) {
			
		}
	}
	
	public FileCrawlerBuilder createFileCrawler(String alias) {
		return new FileCrawlerBuilder();
	}
}
