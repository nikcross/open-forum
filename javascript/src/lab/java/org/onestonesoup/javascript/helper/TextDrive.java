package org.onestonesoup.javascript.helper;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.onestonesoup.core.FileHelper;

public class TextDrive {

	private Drive drive;
	private String user;
	
	public TextDrive() {
		this(null);
	}
	
	public TextDrive(String user) {
		if(user==null) {
			user = "guest";
		}
		this.user = user;
		drive = new Drive("library","user/"+user);
	}

	public void setRoot(String newRoot) {
		drive = new Drive("library/"+newRoot,"user/"+user+"/"+newRoot);
	}
	
	public String getCurrentTime() {
		return ""+System.currentTimeMillis();
	}
	
	public String getLastModified(String fileName) {
		return ""+drive.getFileToRead(fileName).lastModified();
	}
	
	public String getLength(String fileName) {
		return ""+drive.getFileToRead(fileName).length();
	}
	
	public boolean save(String fileName,String data) {
		try {
			FileHelper.saveStringToFile(data, drive.getFileToWrite(fileName));
		} catch (IOException e) {
			return false;
		}
		return true;
	}

	public String load(String fileName) {
		try {
			return FileHelper.loadFileAsString(drive.getFileToRead(fileName));
		} catch (IOException e) {
			return null;
		}
	}
	
	public boolean delete(String fileName) {
		return drive.deleteFile(fileName);
	}
	
	public String[] listFiles(String directory) {
		File dir = drive.getFileToRead(directory);
		List<String> files = new ArrayList<String>();
		for(File file: dir.listFiles()) {
			if(file.isDirectory()) {
				continue;
			}
			files.add(file.getName());
		}
		
		return files.toArray(new String[]{});
	}
	
	public String[] listDirectories(String directory) {
		File dir = drive.getFileToRead(directory);
		List<String> files = new ArrayList<String>();
		for(File file: dir.listFiles()) {
			if(file.isDirectory()==false) {
				continue;
			}
			files.add(file.getName());
		}
		
		return files.toArray(new String[]{});
	}
	
	public boolean createDirectory(String directory) {
		File dir = drive.getFileToWrite(directory);
		return dir.mkdirs();
	}
}
