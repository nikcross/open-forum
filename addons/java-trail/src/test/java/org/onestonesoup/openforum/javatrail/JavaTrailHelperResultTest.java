package org.onestonesoup.openforum.javatrail;

import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;
import org.junit.jupiter.api.*;
import org.onestonesoup.openforum.messagequeue.MessageQueue;
import static org.junit.jupiter.api.Assertions.*;

@Timeout(10)
class JavaTrailHelperResultTest {
    @AfterEach void cleanup() { JavaTrailSystemHelper.clearSessionsForTest(); }
    private String execute(String flags,String reason,String expected,List<String> messages) throws Exception {
        MessageQueue queue=new MessageQueue(){@Override public void postMessage(String message,String owner){messages.add(message);}};
        String json="{\"timedOut\":\"false\",\"completionReason\":\""+reason+"\",\"eventCount\":\"0\",\"events\":[],"+flags+"}";
        JavaTrailSystemHelper helper=new JavaTrailSystemHelper(){
            @Override MessageQueue getQueue(String id){return queue;}
            @Override JavaTrailCam createJavaTrailCam(){return new JavaTrailCam(){@Override public String processUsingConfig(String config){return json;}};}
        };
        String id=helper.runJavaTrailCam("{\"port\":\"5005\",\"startClass\":\"example.App\",\"startMethod\":\"run\"}");
        long deadline=System.nanoTime()+2_000_000_000L;
        while(System.nanoTime()<deadline) {
            String status=helper.getJavaTrailCamStatus(id);
            if(status.contains(expected)&&messages.stream().anyMatch(m->m.contains("Trace completion reason: ")))return status;
            Thread.sleep(10);
        }
        fail("Helper did not finish: "+helper.getJavaTrailCamStatus(id));return "";
    }
    @Test void failureResultIsNotReportedAsSuccessAndNarrativePunctuationSurvives() throws Exception {
        List<String> messages=new CopyOnWriteArrayList<>();
        String status=execute("\"failed\":\"true\"","Processing failed: disk full, incomplete [events]","FAILED",messages);
        assertTrue(status.contains("Processing failed: disk full, incomplete [events]"));
        assertTrue(messages.stream().anyMatch(m->m.contains("Trace completion reason: Processing failed: disk full, incomplete [events]")));
    }
    @Test void truncatedResultRemainsCompatibleButExplicitlyPartial() throws Exception {
        String status=execute("\"truncated\":\"true\"","Reached maxEvents","COMPLETED",new CopyOnWriteArrayList<>());
        assertTrue(status.contains("partial data"));
    }
}
