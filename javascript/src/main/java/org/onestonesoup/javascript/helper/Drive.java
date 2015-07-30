package org.onestonesoup.javascript.helper;

import java.io.File;
import java.io.IOException;
import java.util.Calendar;

import org.onestonesoup.core.FileHelper;

public class Drive {
	
	private String libraryRoot;
	private String userRoot;
	
	public Drive(String libraryRoot,String userRoot) {
		this.libraryRoot = libraryRoot;
		this.userRoot = userRoot;
		if(getUserFile("/").exists()==false) {
			getUserFile("/").mkdirs();
		}
	}
	
	public File getFileToRead(String path) {
		if( getUserFile(path).exists() ) {
			return getUserFile(path);
		} else {
			return getLibraryFile(path);
		}
	}
	
	public File getFileToWrite(String path) {
		File file = getUserFile(path);
		if(file.getParentFile().exists()==false) {
			file.getParentFile().mkdirs();
		}
		if(file.exists()) {
			backupUserFile(path);
		}
		return file;
	}
	
	public boolean deleteFile(String path) {
		if(getUserFile(path).exists()==false) {
			return false;
		}
		backupUserFile(path);
		return getUserFile(path).delete();
	}
	
	private File getUserFile(String path) {
		File file = new File(userRoot+"/"+path);
		return file;
	}
	
	private File getUserBackupFile(String path) {
		File file = new File(userRoot+"/.backup/"+path);
		file.getParentFile().mkdirs();
		return file;
	}
	
	private File getLibraryFile(String path) {
		File file = new File(libraryRoot+"/"+path);
		return file;
	}
	
	private void backupUserFile(String path) {
		File fromFile = getUserFile(path);
		File toFile = getUserBackupFile(path+"."+getTimeStamp()+".backup");
		
		try {
			FileHelper.copyFileToFile(fromFile, toFile);
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
	
	public static String getTimeStamp() {
		return getTimeStamp( System.currentTimeMillis() );
	}
	
	public static String getTimeStamp(long time) {
		Calendar now = Calendar.getInstance();
		String timeStamp = 
				now.get(Calendar.YEAR)+"-"+
				now.get(Calendar.MONTH+1)+"-"+
				now.get(Calendar.DAY_OF_MONTH)+"-"+
				now.get(Calendar.HOUR)+"-"+
				now.get(Calendar.MINUTE)+"-"+
				now.get(Calendar.SECOND)+"-"+
				now.get(Calendar.MILLISECOND);
		
		return timeStamp;
	}
}
