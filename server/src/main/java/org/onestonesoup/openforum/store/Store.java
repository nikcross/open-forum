package org.onestonesoup.openforum.store;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.onestonesoup.core.data.KeyValuePair;

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
	
	public Object remove(String key) {
		Object thing = store.get(key);
		store.remove(key);
		return thing;
	}
	
	public String[] match(String regex) {
		List<String> found = new ArrayList<String>();
		for(String key: getKeys()) {
			if(key.matches(regex)) {
				found.add(key);
			}
		}
		return found.toArray(new String[]{});
	}
}
