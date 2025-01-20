package org.onestonesoup.openforum.server;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Executor;

public class ServerRequestExecuter implements Executor, Runnable {

    private Thread monitorThread;
    private boolean monitoring = false;

    private final long maxThreads;
    private String name;
    private long maxResponseTime;

    private List<RequestThread> requestThreadList = new ArrayList<>();

    private long completedTaskCount = 0;

    private long timeoutTaskCount = 0;

    private long overflowTaskCount = 0;

    private class RequestThread extends Thread {
        private long startTime;
        private long endTime;

        public RequestThread(Runnable runnable) {
            super(runnable, name);
            setPriority(Thread.MAX_PRIORITY);
            startTime = System.currentTimeMillis();
            start();
        }

        public void stopThread() {
            interrupt();
            endTime = System.currentTimeMillis();
        }

        public long getEndTime() {
            return endTime;
        }

        public long getStartTime() {
            return startTime;
        }
    }

    public class OutOfRequestThreadsException extends RuntimeException {
        public OutOfRequestThreadsException( String message ) {
            super(message);
        }
    }

    public ServerRequestExecuter(String name, long maxTime, long maxThreads) {
        this.name = name;
        this.maxResponseTime = maxTime;
        this.maxThreads = maxThreads;

        monitorThread = new Thread(this,name);
        monitorThread.setPriority(Thread.MIN_PRIORITY);
        monitorThread.start();
    }

    @Override
    public void execute(final Runnable runnable) {
        if( maxThreads > 0 && requestThreadList.size() >= maxThreads ){
            overflowTaskCount ++;
            throw new OutOfRequestThreadsException("Out of request threads. Maxium:" + maxThreads);
        }

        RequestThread thread = new RequestThread(runnable);

        requestThreadList.add(thread);
    }

    public boolean isMonitoring() {
        return monitoring;
    }

    public long getMaxResponseTime() {
        return maxResponseTime;
    }

    public String getName() {
        return name;
    }

    public long getMaxThreads() {
        return maxThreads;
    }

    public int getActiveThreads() {
        return requestThreadList.size();
    }


    public long getCompletedTaskCount() {
        return completedTaskCount;
    }

    public long getTimeoutTaskCount() {
        return timeoutTaskCount;
    }

    public long getOverflowTaskCount() {
        return overflowTaskCount;
    }


    @Override
    public void run() {
        if(monitoring) return;
        monitoring = true;
        while(monitoring){

            try{
                long now = System.currentTimeMillis();

                List<RequestThread> stoppedThreads = new ArrayList<>();
                for(RequestThread thread : requestThreadList){

                    try {
                        if( maxResponseTime > 0 && - thread.startTime > maxResponseTime){
                            try {
                                thread.stopThread();
                                timeoutTaskCount++;
                            } catch( Throwable t) {
                                t.printStackTrace();
                            }
                        }

                        if( thread.isInterrupted() || thread.isAlive()==false ) {
                            stoppedThreads.add(thread);
                        }
                    } catch( Throwable t) {
                        t.printStackTrace();
                    }
                }

                for(RequestThread thread : stoppedThreads){
                    requestThreadList.remove(thread);
                    completedTaskCount ++;
                }

                Thread.sleep(100);
            } catch(Throwable t) {
                t.printStackTrace();
            }
        }

        monitoring = false;
    }
}
