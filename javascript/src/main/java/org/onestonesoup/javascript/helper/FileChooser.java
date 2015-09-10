package org.onestonesoup.javascript.helper;

import java.io.File;

import javax.swing.JFileChooser;

public class FileChooser {

	public static File currentPath;
	
	public static String chooseFileToOpen() {
		JFileChooser fileChooser = new JFileChooser();
		if(currentPath!=null) {
			fileChooser.setCurrentDirectory(currentPath);
		}

		int result = fileChooser.showOpenDialog(null);
		fileChooser.setVisible(true);
		
		if(result == JFileChooser.APPROVE_OPTION) {
			currentPath = fileChooser.getCurrentDirectory();
			return fileChooser.getSelectedFile().getAbsolutePath();
		} else {
			return null;
		}
	}
	
	public static String chooseFileToSave() {
		JFileChooser fileChooser = new JFileChooser();
		if(currentPath!=null) {
			fileChooser.setCurrentDirectory(currentPath);
		}

		int result = fileChooser.showSaveDialog(null);
		fileChooser.setVisible(true);
		
		if(result == JFileChooser.APPROVE_OPTION) {
			currentPath = fileChooser.getCurrentDirectory();
			return fileChooser.getSelectedFile().getAbsolutePath();
		} else {
			return null;
		}
	}
	
	public static String chooseFile(String actionText) {
		JFileChooser fileChooser = new JFileChooser();
		if(currentPath!=null) {
			fileChooser.setCurrentDirectory(currentPath);
		}

		int result = fileChooser.showDialog(null,actionText);
		fileChooser.setVisible(true);
		
		if(result == JFileChooser.APPROVE_OPTION) {
			currentPath = fileChooser.getCurrentDirectory();
			return fileChooser.getSelectedFile().getAbsolutePath();
		} else {
			return null;
		}
	}
	
	public File getFile(String fileName) {
		return new File(fileName);
	}
}
