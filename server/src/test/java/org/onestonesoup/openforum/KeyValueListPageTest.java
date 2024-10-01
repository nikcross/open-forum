package org.onestonesoup.openforum;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.Mockito;

import org.mockito.runners.MockitoJUnitRunner;
import org.onestonesoup.openforum.filemanager.FileManager;

import java.util.Map;

import static org.junit.Assert.assertEquals;
import static org.mockito.Matchers.any;

//@RunWith(MockitoJUnitRunner.class)
public class KeyValueListPageTest {

 /*   @Mock
    FileManager mockFileManager;

    @Test
    public void shouldParseListPage() throws Exception {

        String pageContent = "A=123\nB=Hello";
        Mockito.when(mockFileManager.getPageSourceAsString( any(), any() )).thenReturn( pageContent );

        KeyValueListPage page = new KeyValueListPage( mockFileManager, "/OpenForum/Configuration" );
        Map<String,String> map = page.getHashList();

        assertEquals( "123",map.get("A") );
        assertEquals( "Hello",map.get("B") );
    }

    @Test
    public void shouldParseListPageWithRegEx() throws Exception {

        String pageContent = "{{{\n" +
                ".*^(?!.*(OpenForum|Development)).*$.*=/LinkGo\n" +
                "}}}";
        Mockito.when(mockFileManager.getPageSourceAsString( any(), any() )).thenReturn( pageContent );

        KeyValueListPage page = new KeyValueListPage( mockFileManager, "/OpenForum/Configuration" );
        Map<String,String> map = page.getHashList();

        assertEquals( "/LinkGo",map.get(".*^(?!.*(OpenForum|Development)).*$.*") );
    }*/
}
