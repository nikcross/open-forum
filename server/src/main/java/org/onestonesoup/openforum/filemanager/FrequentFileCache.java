package org.onestonesoup.openforum.filemanager;

import java.io.*;
import java.util.Date;
import java.util.HashMap;

public class FrequentFileCache {

    private static long MAX_CACHE_FILE_SIZE = 10000;
    private static long MAX_CACHE_SIZE = 1000000;
    private int TO_CACHE_COUNT = 3;
    private HashMap<String , byte[]> fileCache = new HashMap<>();

    private HashMap<String , CacheRecord> fileCacheRecords = new HashMap<>();

    private class CacheRecord {
        public int views = 1;
        public long lastViewed = new Date().getTime();
        public long lastModified = 0;

        public void incrementViews() {
            views++;
            lastViewed = new Date().getTime();
        }
    }

    private long cacheSize = 0;

    public HashMap<String , CacheRecord> getFileCacheRecords() {
        return (HashMap<String , CacheRecord>)fileCacheRecords.clone();
    }

    public int getCachedFileCount() {
        return fileCache.size();
    }

    public long getCacheSize() {
        return cacheSize;
    }

    public boolean isCached(File file) {

        if( fileCache.containsKey(file.getAbsolutePath()) ) {
            //Check for updates
            //If changed, cache, but if too big/not cached, return false
            if( fileCacheRecords.get(file.getAbsolutePath()).lastModified == file.lastModified() ) {
                return true;
            } else {
                return cacheFile( file );
            }
        } else {
            return false;
        }
    }

    public void checkToCache(File file) {

        if (file.length() > MAX_CACHE_FILE_SIZE) return; //Too big to cache

        if( fileCache.containsKey(file.getAbsolutePath()) ) {
            //Already cached
            return;
        }

        if (fileCacheRecords.containsKey(file.getAbsolutePath())) {
            fileCacheRecords.get(file.getAbsolutePath()).incrementViews();

            if (fileCacheRecords.get(file.getAbsolutePath()).views > TO_CACHE_COUNT) {
                boolean cached = cacheFile( file );
                if( ! cached ) {
                    //Check for cached files that have not been viewed for a long time
                    //Check for cached files that have not been viewed as often
                }
            }
        } else {
            fileCacheRecords.put(file.getAbsolutePath(), new CacheRecord());
        }
    }

    public InputStream getCachedInputStream(File file) {
        //Send stream
        byte[] data = fileCache.get(file.getAbsolutePath());
        return new ByteArrayInputStream(data);
    }


    private boolean cacheFile(final File file) {
        if( cacheSize + file.length() > MAX_CACHE_SIZE ) return false; //Cache is full

        try {
            InputStream iStream = new FileInputStream(file);
            BufferedInputStream bis = new BufferedInputStream(iStream);
            byte[] data = bis.readAllBytes();
            iStream.close();

            fileCache.put(file.getAbsolutePath(), data);
            fileCacheRecords.get(file.getAbsolutePath()).lastModified = file.lastModified();
            cacheSize += data.length;

            return true;
        } catch (IOException e) {
            //Don't cache
            return false;
        }
    }
}
