package org.onestonesoup.openforum;

import java.util.ArrayList;
import java.util.List;

import org.onestonesoup.core.data.KeyValuePair;
import org.onestonesoup.openforum.filemanager.FileManager;
import org.onestonesoup.openforum.security.Login;

public class LinkListPage extends ListPage {

	public LinkListPage(FileManager fileManager,String pageName)
	{
		super( fileManager,pageName );
	}
	
	public void loadPagesList() {

		try{
			String[][] list = DataHelper.getPageAsList( getFileManager().getPageSourceAsString(getPageName(),Login.getGuestLogin()) );
			List<KeyValuePair> newList = new ArrayList<KeyValuePair>();
			
			for(int loop=0;loop<list.length;loop++)
			{
				String key = list[loop][0];
				String value = list[loop][1];
				
				KeyValuePair kvp = new KeyValuePair( key,value );
				newList.add( kvp );
			}
			
			setList(newList);
			setTimeStamp(getFileManager().getPageTimeStamp(getPageName(),Login.getGuestLogin()));
		}
		catch(Exception e){}
	}

}
