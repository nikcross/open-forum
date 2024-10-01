package org.onestonesoup.openforum.server;

import java.io.IOException;
public class OpenForumRequestException extends IOException {

    public OpenForumRequestException(String message) {
        super(message);
    }
}
