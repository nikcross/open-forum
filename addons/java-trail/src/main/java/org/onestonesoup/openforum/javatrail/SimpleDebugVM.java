package org.onestonesoup.openforum.javatrail;

import java.io.IOException;
import java.util.*;

import com.sun.jdi.*;
import com.sun.jdi.connect.AttachingConnector;
import com.sun.jdi.connect.Connector;
import com.sun.jdi.connect.IllegalConnectorArgumentsException;
import com.sun.jdi.event.*;
import com.sun.jdi.request.EventRequestManager;
import com.sun.jdi.request.ModificationWatchpointRequest;

public class SimpleDebugVM implements Runnable{

private VirtualMachine vm;
private Map< String, ReferenceType > referenceMap;
private EventQueue eventQueue;
private FieldChange[] waitingFieldChanges = null;

private boolean running = false;

public SimpleDebugVM(String host, String port) throws IllegalConnectorArgumentsException, IOException {
    connect( host, port );

    Thread thread = new Thread(this);
    thread.start();
}

private void connect(String host, String port) throws IllegalConnectorArgumentsException, IOException {
    AttachingConnector connector = getConnector();

    Map<String, Connector.Argument> args = connector.defaultArguments();
    Connector.Argument portArg = args.get("port");
    portArg.setValue(port);
    Connector.Argument addressArg = args.get("hostname");
    addressArg.setValue(host);

    vm = connector.attach(args);

    List<ReferenceType> referenceTypes = vm.allClasses();
    referenceMap = new HashMap<String, ReferenceType>();

    for (ReferenceType referenceType : referenceTypes) {
        referenceMap.put( referenceType.name(), referenceType);
    }

    eventQueue = vm.eventQueue();
}

public String[] getMatchingClasses( String matcher, int maxValues ) {
    List<String> found = new ArrayList<>();

    for(int mode=0;mode<3; mode++) {
        switch(mode) {
            case 1:
                matcher = matcher + ".*"; // Starts with
                break;
            case 2:
                matcher = ".*" + matcher; // Contains
        }
        //Case sensitive search
        for (String name : referenceMap.keySet()) {
            if ( name.matches(matcher) ) {
                found.add(name);
                if (found.size() >= maxValues) {
                    return found.toArray(new String[found.size()]);
                }
            }
        }
        //Case insensitive search
        for (String name : referenceMap.keySet()) {
            if ( name.toLowerCase().matches(matcher.toLowerCase()) ) {
                found.add(name);
                if (found.size() >= maxValues) {
                    return found.toArray(new String[found.size()]);
                }
            }
        }
    }

    return found.toArray( new String[found.size()] );
}

public String[] getFieldNames(String className) {
    List<String> found = new ArrayList<>();
    for(Field field: referenceMap.get(className).allFields()) {
        found.add( field.name() );
    }
    return found.toArray( new String[found.size()] );
}

public ModificationWatchpointRequest watch( String className, String fieldName ) throws Exception {

    ReferenceType referenceType = referenceMap.get( className );
    if(referenceType == null) {
        throw new Exception( "class " + className + " not found" );
    }

    for (Field field : referenceType.allFields()) {
        if( field.name().equals(fieldName) ) {
            EventRequestManager erm = vm.eventRequestManager();
            ModificationWatchpointRequest modificationWatchpointRequest = erm.createModificationWatchpointRequest(field);
            modificationWatchpointRequest.setEnabled(true);
            return modificationWatchpointRequest;
        }
    }

    throw new Exception( "field name " + fieldName + " in class " + className + " not found" );
}

public void disconnect() {
    running = false;
    vm.dispose();
}

public class FieldChange {
    public String className;
    public String fieldName;
    public String currentValue;
    public String newValue;
    public String[] shortStack;
    FieldChange( String className, String fieldName, String currentValue, String newValue, String[] shortStack ) {
        this.className = className;
        this.fieldName = fieldName;
        this.currentValue = currentValue;
        this.newValue = newValue;
        this.shortStack = shortStack;
    }
}

    public FieldChange[] checkForChanges() throws IncompatibleThreadStateException, InterruptedException, AbsentInformationException {
        if( waitingFieldChanges == null) {
            return new FieldChange[0];
        } else {
            FieldChange[] fieldChanges = waitingFieldChanges;
            waitingFieldChanges = null;
            return fieldChanges;
        }
    }

    public void run() {
        running = true;

        while( running ) {
            try {
                if(waitingFieldChanges==null) {
                        EventSet eventSet = eventQueue.remove();
                        List<FieldChange> fieldChanges = new ArrayList<>();

                        for (Event event : eventSet) {
                            if (event instanceof ModificationWatchpointEvent) {
                                ModificationWatchpointEvent modificationWatchpointEvent = (ModificationWatchpointEvent) event;

                                String className = modificationWatchpointEvent.field().typeName();
                                String fieldName = modificationWatchpointEvent.field().name();
                                String currentValue = "" + modificationWatchpointEvent.valueCurrent();
                                String newValue = "" + modificationWatchpointEvent.valueToBe();
                                List<String> shortStack = new ArrayList<>();

                                List<StackFrame> frames = modificationWatchpointEvent.thread().frames(1, 5);
                                for (StackFrame stackFrame : frames) {
                                    String reference = stackFrame.location().declaringType().name() + "." + stackFrame.location().method().name() + "#" + stackFrame.location().lineNumber();
                                    shortStack.add( reference );
                                }

                                fieldChanges.add(new FieldChange(
                                        className,
                                        fieldName,
                                        currentValue,
                                        newValue,
                                        shortStack.toArray(new String[shortStack.size()])
                                ));
                            }
                        }
                    waitingFieldChanges = fieldChanges.toArray(new FieldChange[fieldChanges.size()]);

                    eventSet.resume();
                }
                Thread.sleep( 1000 );

            } catch (IncompatibleThreadStateException e) {
                throw new RuntimeException(e);
            } catch (InterruptedException e) {
                throw new RuntimeException(e);
            }
        }
    }

    private AttachingConnector getConnector() {
        VirtualMachineManager vmManager = Bootstrap.virtualMachineManager();

        for (Connector connector : vmManager.attachingConnectors()) {
            if("com.sun.jdi.SocketAttach".equals(connector.name()))
                return (AttachingConnector) connector;
        }
        throw new IllegalStateException();
    }
}
