package org.onestonesoup.openforum.javatrail;

import java.io.IOException;
import com.sun.jdi.connect.IllegalConnectorArgumentsException;

/** Compatibility adapter; tracing and JSON processing live in the independent library. */
public class JavaTrailCam extends org.onestonesoup.javatrail.JavaTrailCam {
    @Override
    public SimpleDebugVM connect(String host, String port) throws IllegalConnectorArgumentsException, IOException {
        return new SimpleDebugVM(host, port);
    }

    @Override
    public SimpleDebugVM connect(Config config) throws IllegalConnectorArgumentsException, IOException {
        return connect(config.getHost(), config.getPort());
    }

    @Override
    public SimpleDebugVM getActiveVm() {
        return (SimpleDebugVM) super.getActiveVm();
    }
}
