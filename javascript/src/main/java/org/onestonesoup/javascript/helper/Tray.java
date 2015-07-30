package org.onestonesoup.javascript.helper;

import java.awt.AWTException;
import java.awt.Image;
import java.awt.MenuItem;
import java.awt.PopupMenu;
import java.awt.SystemTray;
import java.awt.TrayIcon;
import java.awt.TrayIcon.MessageType;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;

import javax.imageio.ImageIO;

import org.onestonesoup.javascript.engine.JavascriptEngine;

public class Tray implements ActionListener {
	private SystemTray tray = SystemTray.getSystemTray();
	private JavascriptEngine js;
	private Map<String,TrayIcon> trayIcons = new HashMap<String,TrayIcon>();
	
	@JSMethodHelp(exclude=true)
	public void setJavascriptEngine(JavascriptEngine js) {
		this.js = js;
	}
	
	@JSMethodHelp(signature="<a name for the tray icon>,<a url for the tray icon image>")
	public void addTrayIcon(String trayName,String iconURL) throws MalformedURLException, IOException, AWTException {
		Image image = null;
		if(iconURL.indexOf(":")==-1) {
			image = ImageIO.read(this.getClass().getResource(iconURL));
		} else {
			image = ImageIO.read( new URL(iconURL) );
		}
		TrayIcon trayIcon = new TrayIcon(image,trayName);
		SystemTray.getSystemTray().add(trayIcon);

		trayIcons.put(trayName, trayIcon);
	}
	
	@JSMethodHelp(signature="<the name of the tray icon>,<the display name of the action>,<the action javascript to run>")	
	public void addActionToTrayIcon(String trayName,String actionName,String action) {
		TrayIcon trayIcon = trayIcons.get(trayName);
		
		PopupMenu popup = trayIcon.getPopupMenu();
		if(popup==null) {
			popup = new PopupMenu("Options");
			trayIcon.setPopupMenu(popup);
		}
		
		MenuItem menuItem = new MenuItem(actionName);
		menuItem.setActionCommand(action);
		menuItem.addActionListener(this);
		popup.add(menuItem);
	}
	
	@JSMethodHelp(signature="<the name of the tray icon>,<the message title>,<a url for the tray icon image>")	
	public void setTrayIconImage(String trayName,String iconURL) throws IOException {
		TrayIcon trayIcon = trayIcons.get(trayName);
		
		Image image = null;
		if(iconURL.indexOf(":")==-1) {
			image = ImageIO.read(this.getClass().getResource(iconURL));
		} else {
			image = ImageIO.read( new URL(iconURL) );
		}

		trayIcon.setImage(image);
	}
	
	@JSMethodHelp(signature="<the name of the tray icon>,<the message title>,<the message>")	
	public void showTrayIconMessage(String trayName,String title,String message) {
		TrayIcon trayIcon = trayIcons.get(trayName);
		trayIcon.displayMessage(title, message, MessageType.NONE);
	}	
	
	@JSMethodHelp(signature="<the name of the tray icon>,<the information message title>,<the information message>")	
	public void showTrayIconInfoMessage(String trayName,String title,String message) {
		TrayIcon trayIcon = trayIcons.get(trayName);
		trayIcon.displayMessage(title, message, MessageType.INFO);
	}
	
	@JSMethodHelp(signature="<the name of the tray icon>,<the error message title>,<the error message>")	
	public void showTrayIconErrorMessage(String trayName,String title,String message) {
		TrayIcon trayIcon = trayIcons.get(trayName);
		trayIcon.displayMessage(title, message, MessageType.ERROR);
	}
	
	@JSMethodHelp(signature="<the name of the tray icon>,<the warning message title>,<the warning message>")	
	public void showTrayIconWarningMessage(String trayName,String title,String message) {
		TrayIcon trayIcon = trayIcons.get(trayName);
		trayIcon.displayMessage(title, message, MessageType.WARNING);
	}

	@Override
	@JSMethodHelp(exclude=true)
	public void actionPerformed(ActionEvent e) {
		try {
			js.evaluateJavascript("System Tray", e.getActionCommand());
		} catch (Throwable e1) {
			e1.printStackTrace();
		}
	}
}
