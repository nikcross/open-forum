package org.onestonesoup.javascript.cli;

import org.testng.annotations.Test;

import static org.testng.AssertJUnit.assertEquals;

public class JavascriptCommandLineInterfaceTest {
    @Test
    public void testRunsScript() throws Throwable {

        String[] args = new String[0];
        JavascriptCommandLineInterface.main(args);

        JavascriptCommandLineInterface.JSInterface jsi = null;
        while(jsi==null) {
            System.out.println("Waiting");
            Thread.sleep( 1000 );
            jsi = JavascriptCommandLineInterface.getInstance();
        }

        String value = (String)jsi.runScript("src/test/resources/test.js");

        assertEquals("Hello World",value);
    }

}
