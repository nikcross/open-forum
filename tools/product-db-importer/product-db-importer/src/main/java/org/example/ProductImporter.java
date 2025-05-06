package org.example;

import org.onestonesoup.openforum.jdbc.DatabaseAPI;
import org.onestonesoup.openforum.plugin.SystemAPI;
import org.onestonesoup.openforum.security.Login;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

public class ProductImporter extends SystemAPI {

    private static final String VERSION = "1.0.6";

    private DatabaseAPI databaseAPI;

    private void init() throws Throwable {

        databaseAPI = (DatabaseAPI) getController().getApi("/OpenForum/AddOn/SQL");

    }

    public String getVersion() {
        return VERSION;
    }

    public void importData() throws Throwable {
        init();

        // 3728706 rows
        String fileName = "/home/nik/Documents/One Stone Soup/Barcode Data/openfoodfacts-products.jsonl";
        File file = new File(fileName);
        FileInputStream fis = new FileInputStream(file);

        Long fileLength = file.length();

        Map<String, Long> materialTag = new HashMap();

        StringBuffer record = new StringBuffer();
        String entry = "";
        Long records = 0L;
        Long start = 276365L;
        for (Long i = 0L; i < fileLength; i++) {

            byte d = (byte) fis.read();
            if (d == '\n') {
                records++;

                if( records<start ) {
                    record = new StringBuffer();
                    continue;
                }

                try {
                    entry = record.toString();

                    String barcode = entry.substring(entry.indexOf("_id\":") + 6);
                    barcode = barcode.substring(0, barcode.indexOf("\""));

                    String name = entry.substring(entry.indexOf("product_name\":") + 15);
                    name = name.substring(0, name.indexOf("\"")).replaceAll("'","''");

                    Long productId = saveProduct(name, barcode);

                    String packagingsMaterials = "";
                    if (entry.indexOf("packagings_materials\":{") != -1) {
                        packagingsMaterials = entry.substring(entry.indexOf("packagings_materials\":{") + 23);
                        packagingsMaterials = packagingsMaterials.substring(0, packagingsMaterials.indexOf("}"));
                    }

                    String packagingsMaterialsTags = "";
                    if (entry.indexOf("packaging_materials_tags\":[") != -1) {
                        packagingsMaterialsTags = entry.substring(entry.indexOf("packaging_materials_tags\":[") + 27);
                        packagingsMaterialsTags = packagingsMaterialsTags.substring(0, packagingsMaterialsTags.indexOf("]"));
                    }


                    if (packagingsMaterials.isEmpty() == false || packagingsMaterialsTags.isEmpty() == false) {
                        //System.out.println(records + ". " + barcode + " Name: " + name + " P: " + packagingsMaterials+" Tags: " + packagingsMaterialsTags);
                        //System.out.println(entry);

                        String[] tags = packagingsMaterialsTags.split(",");
                        for (String tag : tags) {
                            Long packagingId = 0L;
                            if (materialTag.containsKey(tag) == false) {

                                packagingId = savePackaging( tag );

                                materialTag.put(tag, packagingId);
                            } else {
                                packagingId = materialTag.get(tag);
                            }

                            saveProductPackaging( productId, packagingId );

                           /* if (tag.contains("o-7-other-plastics")) {
                                System.out.println(records + ". " + barcode + " Name: " + name + " P: " + packagingsMaterials + " Tags: " + packagingsMaterialsTags);
                                System.out.println(entry);
                            }*/
                        }
                    }
                } catch (StringIndexOutOfBoundsException e) {
                    getController().getLogger().debug("No Name Found");
                } catch (Throwable e) {
                    getController().getFileManager().appendStringToFile(entry+"\n","/HomeLab/ProductsDB","failed-entries.jsonl"
                            , false, false, getController().getSystemLogin());
                }
                //System.out.println( records + ": " + record.toString() );
                record = new StringBuffer();


                //if(records >= 1000L) break;
                //if (records >= 10L) break;
            } else {
                record.append((char) d);
            }

            if (i % 1000 == 0) {
                getController().getLogger().debug( "Processed " + i );
            }
        }
    }

    private void saveProductPackaging(Long product_id, Long packaging_id) throws Throwable {
        String sql = "INSERT INTO product_packaging(product_id, packaging_id) VALUES ('"
        + product_id + "', '" + packaging_id + "')";

        //getController().getLogger().debug(sql);

        databaseAPI.execute( "product", sql );
    }

    private Long savePackaging( String name ) throws Exception {
        String sql = "INSERT INTO packaging (name) VALUES ('" + name + "') returning id";

        //getController().getLogger().debug(sql);

        String result = databaseAPI.query( "product", sql );

        //getController().getLogger().debug( result );

        return parseId( result );
    }

    private Long saveProduct(String name, String barcode) throws Exception {

        String sql = "INSERT INTO product (name, barcode) VALUES ('" + name + "', '" + barcode + "') returning id";

        getController().getLogger().debug( sql );

        String result = databaseAPI.query( "product", sql );

        return parseId( result );
    }


    private Long parseId(String result) {
        String id = result.substring( result.indexOf("cell0")+8 );
        id = id.substring( 0, id.indexOf("\"") );
        return Long.parseLong( id );
    }
}
