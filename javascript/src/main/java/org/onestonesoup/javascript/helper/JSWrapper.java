package org.onestonesoup.javascript.helper;

import java.lang.reflect.Method;

public class JSWrapper {

	public String convertJavaObjectToJSObject(Object object) {
		Class clazz = object.getClass();
		String js = "function "+clazz.getName()+"(javaObject) {\n";
			js += " var javaObject = javaObject;\n";
			
			for(Method method: clazz.getDeclaredMethods()) {
				js += " this."+method.getName()+" = function(";
				int index=0;
				for(Class pClass: method.getParameterTypes()) {
					if(index>0) {
						js += ",";
					}
					js += index+pClass.getName();
					index++;
				}
				js += ") {\n";
				js += "};\n";
			}
		js+="}\n";
		return js;
	}
}
