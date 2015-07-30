package org.onestonesoup.openforum.router;

import org.onestonesoup.core.data.EntityTree;

public interface RouterLogger {

	public void logRequest(EntityTree httpHeader);
}
