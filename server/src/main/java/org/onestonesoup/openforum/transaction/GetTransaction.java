package org.onestonesoup.openforum.transaction;

import org.onestonesoup.core.data.EntityTree;
import org.onestonesoup.openforum.controller.OpenForumController;
import org.onestonesoup.openforum.filemanager.FileServer;
import org.onestonesoup.openforum.security.Login;
import org.onestonesoup.openforum.servlet.ClientConnectionInterface;

public class GetTransaction extends Transaction{
	
	public GetTransaction(EntityTree httpHeader,ClientConnectionInterface connection,FileServer fileServer,OpenForumController controller,Login login) {
		super( httpHeader,connection,fileServer,controller,login );
	}	
}
