package org.onestonesoup.openforum;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.runners.MockitoJUnitRunner;

import java.util.Map;

import static org.junit.Assert.assertEquals;


@RunWith(MockitoJUnitRunner.class)
public class DataHelperTest {

    @Test
    public void shouldParseWikiTable() {
        //Given
        String data = "|A|1\\|B|2\\|C|3\\|D";

        //When
        Map<String, String> table = DataHelper.getWikiTableAsTable(data);

        //Then
        assertEquals( 4, table.size() );
        assertEquals( "1", table.get("A") );
        assertEquals( "2", table.get("B") );
        assertEquals( "3", table.get("C") );
        assertEquals( "", table.get("D") );
    }


    @Test
    public void shouldParseTable() {
        //Given
        String data = "A=1\\*B=2\\*C=3\\D=";

        //When
        Map<String, String> table = DataHelper.getPageAsTable(data);

        //Then
        assertEquals( 4, table.size() );
        assertEquals( "1", table.get("A") );
        assertEquals( "2", table.get("B") );
        assertEquals( "3", table.get("C") );
        assertEquals( "", table.get("D") );
    }
}
