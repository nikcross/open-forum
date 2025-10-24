package org.onestonesoup.openforum.javatrail;

import java.io.IOException;
import com.sun.jdi.connect.IllegalConnectorArgumentsException;

/**
 * Command-line helper for monitoring field changes in a remote JVM.
 * <p>
 * The entry point accepts four ordered arguments (class, field, host, port),
 * attaches via {@link SimpleDebugVM}, registers a modification watchpoint, and
 * prints change summaries at a steady polling interval. The public
 * {@link #connect(String, String)} method is reusable by other tooling that
 * needs to share the same attach workflow.
 */
public class JavaTrail {

    /**
     * Launches the JavaTrail watcher.
     *
     * @param args class name, field name, debug host, debug port (in that order)
     * @throws Exception when connection or watch registration fails
     */
    public static void main(String[] args) throws Exception {

        String className = args[0];
        String fieldName = args[1];
        String host = args[2];
        String port = args[3];

        SimpleDebugVM vm = new JavaTrail().connect(host, port);

        vm.watch( className, fieldName );

        while(true) {
            Thread.sleep( 5000 );

            SimpleDebugVM.FieldChange[] fieldChanges = vm.checkForChanges();

            if(fieldChanges.length == 0) {
                System.out.println( "No Changes" );
            } else {
                for(SimpleDebugVM.FieldChange fieldChange: fieldChanges) {
                    System.out.println( "Class:" + fieldChange.className );
                    System.out.println( " Field:" + fieldChange.fieldName );
                    System.out.println( "  From:" + fieldChange.currentValue );
                    System.out.println( "  To:" + fieldChange.newValue );

                    for(String step: fieldChange.shortStack) {
                        System.out.println( "    Stack:" + step );
                    }
                }
            }
        }
    }

    /**
     * Connects to a remote JVM debug session using a socket attach.
     *
     * @param host remote host or IP exposing the debug port
     * @param port remote debug port
     * @return connected {@link SimpleDebugVM}
     * @throws IllegalConnectorArgumentsException when attach parameters are invalid
     * @throws IOException when the attach transport cannot be opened
     */
    public SimpleDebugVM connect(String host, String port) throws IllegalConnectorArgumentsException, IOException {
        return new SimpleDebugVM( host, port );
    }
}
