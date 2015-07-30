package org.onestonesoup.javascript.helper;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.util.Iterator;

public class ScriptStreamer {

	public class Streamer {
		private BufferedReader reader = null;
		private Iterator<String> iterator;
		
		public Streamer(File file) throws FileNotFoundException {
			reader = new BufferedReader(new FileReader(file));
			iterator = reader.lines().iterator();
		}
		
		public boolean hasMoreLines() {
			return iterator.hasNext();
		}
		
		public String nextLine() {
			return iterator.next();
		}
	}
	
	public Streamer getStreamer(String fileName) throws FileNotFoundException {
		return new Streamer(new File(fileName));
	}
}
