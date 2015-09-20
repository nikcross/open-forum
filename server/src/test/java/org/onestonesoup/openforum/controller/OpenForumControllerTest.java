package org.onestonesoup.openforum.controller;

/*import static org.mockito.BDDMockito.given;
import static org.mockito.Matchers.eq;
import static org.mockito.Matchers.isNull;
import static org.mockito.Mockito.mock;*/

import org.onestonesoup.openforum.security.AuthenticationException;

public class OpenForumControllerTest {

	public void canBuildPage() throws AuthenticationException, Exception {
		
		OpenForumController controller = new OpenForumController("test", "test");
		
		String html = controller.buildPage("TestPage").toString();
	}
}
