package org.onestonesoup.openforum;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.onestonesoup.core.data.KeyValuePair;
import org.onestonesoup.openforum.filemanager.FileManager;
import org.onestonesoup.openforum.security.Login;

public class KeyValueListPage extends ListPage {

	private Map<String,String> hashList;
	
	public KeyValueListPage(FileManager fileManager,String pageName)
	{
		super( fileManager,pageName );
	}
	
	public void loadPagesList() {

		try{
			Map<String,String> list = DataHelper.getPageAsTable( getFileManager().getPageSourceAsString(getPageName(),Login.getGuestLogin()) );
			List<KeyValuePair> newList = new ArrayList<KeyValuePair>();
			
			for(String key: list.keySet())
			{
				String value = list.get(key);
				
				KeyValuePair kvp = new KeyValuePair( key,value );
				newList.add( kvp );
			}
			
			setList(newList);
			setTimeStamp(getFileManager().getPageTimeStamp(getPageName(),Login.getGuestLogin()));
			
			hashList = list;
		}
		catch(Exception e){}
	}

	public Map<String,String> getHashList() throws Exception {
		loadPagesList();
		return hashList;
	}
	
	public String getValue(String key) throws Exception {
		if(hashList==null) {
			getHashList();
		}
		
		return hashList.get(key);
	}
}
