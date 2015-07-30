package org.onestonesoup.javascript.helper;

import java.awt.AWTException;
import java.awt.Robot;
import java.awt.event.InputEvent;
import java.io.File;
import java.lang.management.ManagementFactory;
import java.net.Inet6Address;
import java.net.InetAddress;
import java.net.NetworkInterface;
import java.net.SocketException;
import java.util.Enumeration;

import org.onestonesoup.core.StringHelper;

public class Computer {

	private static Robot robot = null;
	private static Integer mouseX = null;
	private static Integer mouseY = null;
	
	public static String getOperatingSystem() {
		return System.getProperty("os.name");
	}
	
	public static String getOperatingSystemVersion() {
		return System.getProperty("os.version");
	}
	
	public static String getJavaVersion() {
		return System.getProperty("java.vendor")+" "+System.getProperty("java.version");
	}
	
	public static String getIpAddress(String interfaceName) throws SocketException {
		Enumeration<InetAddress> i = NetworkInterface.getByName(interfaceName).getInetAddresses();
		while(i.hasMoreElements()) {
			InetAddress a = i.nextElement();
			if(a instanceof Inet6Address) continue;
			if(a.isLoopbackAddress()==false) {
				return a.getHostAddress();
			}
		}
		return null;
	}
	
	public static String getMACAddress(String interfaceName) throws SocketException {
		return StringHelper.asHex(NetworkInterface.getByName(interfaceName).getHardwareAddress());
	}
	
	public static long getTime() {
		return System.currentTimeMillis();
	}
	
	public static long getStartTime() {
		return ManagementFactory.getRuntimeMXBean().getStartTime();
	}
	
	@JSMethodHelp(signature="<path to drive>")
	public static long getDriveTotalSpace(String path) {
		return new File(path).getTotalSpace();
	}
	
	@JSMethodHelp(signature="<path to drive>")
	public static long getDriveFreeSpace(String path) {
		return new File(path).getFreeSpace();
	}
	
	public static String getProcessor() {
		return System.getProperty("os.arch");
	}
	
	public static int getProcessorLoad() {
		return (int)(ManagementFactory.getOperatingSystemMXBean().getSystemLoadAverage()*100);
	}
	
	public static long getProcessorUsed() {
		return ManagementFactory.getThreadMXBean().getCurrentThreadCpuTime();
	}
	
	public static int getProcessors() {
		return ManagementFactory.getOperatingSystemMXBean().getAvailableProcessors();
	}
	
	public static long getMemory() {
		return Runtime.getRuntime().totalMemory();
	}
	
	public static long getMemoryUsed() {
		return Runtime.getRuntime().totalMemory()-Runtime.getRuntime().freeMemory();
	}
	
	public static void setMouse(int x,int y) throws AWTException {
		getRobot().mouseMove(x, y);
	}
	
	public static void moveMouse(int x, int y) throws AWTException {
		if(mouseX==null) {
			mouseX = 0;
			mouseY = 0;
		}
		mouseX+=x;
		mouseY+=y;
		
		setMouse(mouseX,mouseY);
	}
	
	public static void pressLeftMouseButton() throws AWTException {
		getRobot().mousePress(InputEvent.BUTTON1_DOWN_MASK);
	}
	
	public static void pressRightMouseButton() throws AWTException {
		getRobot().mousePress(InputEvent.BUTTON2_DOWN_MASK);
		
	}
	
	public static void pressMiddleMouseButton() throws AWTException {
		getRobot().mousePress(InputEvent.BUTTON3_DOWN_MASK);
	}
	
	public static void scrollMouse(int y) throws AWTException {
		getRobot().mouseWheel(y);
	}
	
	public static void releaseLeftMouseButton() throws AWTException {
		getRobot().mouseRelease(InputEvent.BUTTON1_DOWN_MASK);
	}
	
	public static void releaseRightMouseButton() throws AWTException {
		getRobot().mouseRelease(InputEvent.BUTTON2_DOWN_MASK);
	}
	
	public static void releaseMiddleMouseButton() throws AWTException {
		getRobot().mouseRelease(InputEvent.BUTTON3_DOWN_MASK);
	}
	
	public static void typeKey(int keycode) throws AWTException {
		pressKey(keycode);
		releaseKey(keycode);
	}
	
	public static void pressKey(int keycode) throws AWTException {
		getRobot().keyPress(keycode);
	}
	
	public static void releaseKey(int keycode) throws AWTException {
		getRobot().keyRelease(keycode);
	}
	
	private static Robot getRobot() throws AWTException {
		if(robot==null) {
			robot = new Robot();
		}
		return robot;
	}
}
