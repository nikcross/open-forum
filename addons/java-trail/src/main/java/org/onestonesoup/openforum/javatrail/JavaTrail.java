package org.onestonesoup.openforum.javatrail;

import java.io.IOException;
import com.sun.jdi.connect.IllegalConnectorArgumentsException;

/** Preserves the API class registered by existing /JavaTrail pages. */
public class JavaTrail extends org.onestonesoup.javatrail.JavaTrail {
    @Override
    public SimpleDebugVM connect(String host, String port) throws IllegalConnectorArgumentsException, IOException {
        return new SimpleDebugVM(host, port);
    }
}
