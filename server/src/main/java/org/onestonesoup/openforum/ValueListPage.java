package org.onestonesoup.openforum;

import java.util.ArrayList;

import org.onestonesoup.core.data.KeyValuePair;
import org.onestonesoup.openforum.filemanager.FileManager;
import org.onestonesoup.openforum.security.Login;

public class ValueListPage extends ListPage {
	
	public ValueListPage(FileManager fileManager,String pageName)
	{
		super( fileManager,pageName );
	}
	
	public void loadPagesList() {

		try{
			ArrayList<KeyValuePair> list = DataHelper.getPageAsKeyValuePairList( getFileManager().getPageSourceAsString(getPageName(),Login.getGuestLogin()) );
			
			setList(list);
			setTimeStamp(getFileManager().getPageTimeStamp(getPageName(),Login.getGuestLogin()));
		}
		catch(Exception e){}
	}
}
