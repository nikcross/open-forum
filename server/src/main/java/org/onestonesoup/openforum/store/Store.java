package org.onestonesoup.openforum.store;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

public class Store {
	private Map<String,Object> store = new HashMap<String,Object>();
	
	public Set<String> getKeys() {
		return store.keySet();
	}
	
	public Object get(String key) {
		return store.get(key);
	}
	
	public void set(String key,Object value) {
		store.put(key,value);
	}
}
