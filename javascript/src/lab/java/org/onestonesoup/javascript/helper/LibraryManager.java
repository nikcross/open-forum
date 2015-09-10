package org.onestonesoup.javascript.helper;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.onestonesoup.core.FileHelper;
import org.onestonesoup.core.javascript.JSONHelper;

public class LibraryManager {

	public class PackageDetails {
		public String getName() {
			return name;
		}
		public String getVersion() {
			return version;
		}
		public String getHomeURL() {
			return homeURL;
		}
		public String[] getPackageDependencies() {
			return packageDependencies;
		}
		private String name;
		private String version;
		private String homeURL;
		private String[] packageDependencies;
	}
	
	private Map<String,PackageDetails> packages = new HashMap<String,PackageDetails> ();
	
	//name.version	
	public String[] findPackages(String matcher) {
		List<String> keys = new ArrayList<String>();
		for(String key: packages.keySet()) {
			if(key.matches(matcher)) {
				keys.add(key);
			}
		}
		return keys.toArray(new String[]{});
	}
	
	public PackageDetails getPackage(String name) {
		return packages.get(name);
	}
	
	public void initialise(String fileName) {
		//EntityTree tree = JSONHelper.fromJSON(fileName);
		//for each package
		//	create package
		//	add to packages
	}
	
	public void persist(String fileName) throws IOException {
		
		List<PackageDetails> packageList = new ArrayList<PackageDetails>();
		for(String key: packages.keySet()) {
				packageList.add(packages.get(key));
		}
		FileHelper.saveStringToFile(JSONHelper.toJSON(packageList), fileName);
	}
	
	public void installPackage(PackageDetails packageDetails) {
		//TODO
		//download package into temporary area
		//unzip package
		//for each file in package,
			//backup the current version
			//copy in the new version
			//log the change
	}
	
	public PackageDetails createPackage(PackageDetails oldPackageDetails,String name,String version,String homeURL) {
		//TODO
		//create new package details
		//zip the files into a package
		//upload the package to the homeURL
		//return the new package details
		return null;
	}
}
