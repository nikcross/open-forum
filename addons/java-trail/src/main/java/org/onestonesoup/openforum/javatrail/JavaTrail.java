package org.onestonesoup.openforum.javatrail;

import java.io.IOException;
import com.sun.jdi.connect.IllegalConnectorArgumentsException;

public class JavaTrail {

    public static void main(String[] args) throws Exception {
        SimpleDebugVM vm = new JavaTrail().connect("localhost", "5008");

        vm.watch( "net.orfdev.hedgehog.quote.domain.basis.Basis", "vehicle" );

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

    public SimpleDebugVM connect(String host, String port) throws IllegalConnectorArgumentsException, IOException {
        return new SimpleDebugVM( host, port );
    }
}
