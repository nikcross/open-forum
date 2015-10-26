package org.onestonesoup.openforum.store;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.onestonesoup.core.data.KeyValuePair;

public class Store {
	private Map<String,String> store = new HashMap<String,String>();
	
	public Set<String> getKeys() {
		return store.keySet();
	}
	
	public Object get(String key) {
		return store.get(key);
	}
	
	public void set(String key,String value) {
		store.put(key,value);
	}
	
	public List<KeyValuePair> find(String regex) {
		List<KeyValuePair> found = new ArrayList<KeyValuePair>();
		for(String key: getKeys()) {
			if(key.matches(regex)) {
				found.add(new KeyValuePair(key, store.get(key)));
			}
		}
		return found;
	}
}
