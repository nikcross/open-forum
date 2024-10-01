package org.onestonesoup.openforum.javascript;

import org.junit.Test;

import static org.junit.Assert.assertEquals;

public class JavascriptHelperTest
{
    @Test
    public void canGenerateMD5() {
        String md5 = new JavascriptHelper(null,null,null,null)
            .generateMD5( "ABC" );

        assertEquals("902FBDD2B1DF0C4F70B4A5D23525E932",md5);
    }
}
