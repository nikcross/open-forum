package org.onestonesoup.openforum.javatrail;

import java.io.IOException;
import com.sun.jdi.connect.IllegalConnectorArgumentsException;

/** Compatibility adapter for existing OpenForum scripts. */
public class SimpleDebugVM extends org.onestonesoup.javatrail.SimpleDebugVM {
    public SimpleDebugVM(String host, String port) throws IllegalConnectorArgumentsException, IOException {
        super(host, port);
    }
}
