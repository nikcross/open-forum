package org.onestonesoup.javascript.helper;

import javax.swing.JOptionPane;

public class Popup {

	@JSMethodHelp(signature="<an alert message to display>")
	public static void alert(String message) {
		JOptionPane.showMessageDialog(null, message);
	}
	
	@JSMethodHelp(signature="<a question for the user to answer with yes, no or cancel>")
	public static Boolean confirm(String message) {
		int result = JOptionPane.showConfirmDialog(null, message);
		if(result==JOptionPane.YES_OPTION) {
			return true;
		} else if(result==JOptionPane.NO_OPTION) {
			return false;
		} else {
			return null;
		}
	}
	
	@JSMethodHelp(signature="<a description of the value you want a user to enter>")
	public static String requestInput(String message) {
		return JOptionPane.showInputDialog(null, message);
	}

	@JSMethodHelp(signature="<a question you want the user to answer>,<array of options the user can choose>")
	public static String requestChoice(String message,String[] options) {
		int result = JOptionPane.showOptionDialog(null, message, "", JOptionPane.DEFAULT_OPTION, JOptionPane.QUESTION_MESSAGE, null, options, options[0]);
		return options[result];
	}
}
