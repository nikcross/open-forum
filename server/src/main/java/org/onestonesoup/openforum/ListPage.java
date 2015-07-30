package org.onestonesoup.openforum;

import java.io.IOException;
import java.util.List;

import org.onestonesoup.core.data.KeyValuePair;
import org.onestonesoup.openforum.filemanager.FileManager;
import org.onestonesoup.openforum.security.AuthenticationException;
import org.onestonesoup.openforum.security.Login;

public abstract class ListPage {

	private long timeStamp;
	private FileManager fileManager;
	private String pageName;
	private List<KeyValuePair> list;
	
	public ListPage(FileManager fileManager,String pageName)
	{
		this.fileManager = fileManager;
		this.pageName = pageName;
		
		loadPagesList();
	}
	
	public boolean pageHasChanged() throws Exception
	{
		try{
			if( fileManager.getPageTimeStamp(pageName,Login.getGuestLogin())==timeStamp)
			{
				return false;
			}
			else
			{
				return true;
			}
		}
		catch(AuthenticationException ae){}
		return true;
	}
	
	
	public abstract void loadPagesList();
	
	public List<KeyValuePair> getList() throws Exception
	{
		if(pageHasChanged())
		{
			try{
				timeStamp = fileManager.getPageTimeStamp(pageName,Login.getGuestLogin());
			}
			catch(AuthenticationException ae)
			{
				throw new IOException( ae.getMessage() );
			}
			loadPagesList();
		}
		
		return list;
	}

	protected void setList(List<KeyValuePair> list) {
		this.list = list;
	}

	protected FileManager getFileManager() {
		return fileManager;
	}

	public String getPageName() {
		return pageName;
	}

	protected void setTimeStamp(long timeStamp) {
		this.timeStamp = timeStamp;
	}
}
