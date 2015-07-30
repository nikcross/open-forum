package org.onestonesoup.javascript.helper;

import java.lang.reflect.Method;
import java.lang.reflect.Modifier;

import org.mozilla.javascript.NativeJavaClass;
import org.onestonesoup.javascript.engine.JavascriptEngine;

public class JSHelp {

	private static JSHelp jsHelp;
	
	private JavascriptEngine javascriptEngine;
	
	public JSHelp() {
		jsHelp = this;
	}
	
	public void setJavascriptEngine(JavascriptEngine javascriptEngine) {
		this.javascriptEngine = javascriptEngine;
	}
	
	private static JavascriptEngine getJavascriptEngine() {
		return jsHelp.javascriptEngine;
	}
	
	public static String help(Object object,String name) {
		StringBuffer buffer = new StringBuffer();
		
		Class clazz = object.getClass();
		if( object instanceof NativeJavaClass ) {
			NativeJavaClass njc = (NativeJavaClass)object;
			clazz = njc.getClassObject();
		}

		if(name==null) {
			name = getJavascriptEngine().getObjectKey(object);
			if(name==null) {
				name = clazz.getName();
				name = name.substring(name.lastIndexOf(".")+1);
			}
		}
		
		Method[] methods = clazz.getDeclaredMethods();
		buffer.append("("+clazz+") "+name+"\n");
		for(Method method: methods) {
			if(Modifier.isPublic(method.getModifiers())==false) {
				continue;
			}
			if(method.getAnnotation(JSMethodHelp.class)!=null) {
				JSMethodHelp jsMethodHelp = (JSMethodHelp)method.getAnnotation(JSMethodHelp.class);
				buffer.append(name+"."+method.getName()+"("+jsMethodHelp.signature()+")\n");
				continue;
			}
			String methodLine = name+"."+method.getName()+"(";
			Class<?>[] params = method.getParameterTypes();
			String paramString = "";
			for(Class param: params) {
				if(paramString.length()>0) {
					paramString+=", ";
				}
				paramString+=param.getSimpleName();
			}
			methodLine += paramString;
			methodLine+=")";
			methodLine+=" "+method.getReturnType().getSimpleName();
			
			buffer.append( methodLine+"\n" );
		}
		return buffer.toString();
	}
}
