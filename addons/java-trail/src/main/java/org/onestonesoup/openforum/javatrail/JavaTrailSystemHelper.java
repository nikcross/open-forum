package org.onestonesoup.openforum.javatrail;

import java.io.IOException;

import com.sun.jdi.connect.IllegalConnectorArgumentsException;

import org.onestonesoup.core.data.EntityTree;
import org.onestonesoup.core.data.JsonHelper;
import org.onestonesoup.openforum.messagequeue.MessageQueue;
import org.onestonesoup.openforum.messagequeue.MessageQueueManager;
import org.onestonesoup.openforum.plugin.SystemAPI;

public class JavaTrailSystemHelper extends SystemAPI {
    private static final String OWNER = "JavaTrailSystemHelper";
    private static final String JAVA_TRAIL_QUEUE = "/Test/JavaTrail";
    private static final String JAVA_TRAIL_CAM_QUEUE = "/Test/JavaTrailCam";

    public SimpleDebugVM connectJavaTrail(String host, String port) throws IllegalConnectorArgumentsException, IOException {
        MessageQueue queue = getQueue(JAVA_TRAIL_QUEUE);
        post(queue, "Connecting to JavaTrail at " + host + ":" + port);

        JavaTrail javaTrail = new JavaTrail();
        SimpleDebugVM vm = javaTrail.connect(host, port);

        post(queue, "JavaTrail connected to " + host + ":" + port);
        return vm;
    }

    public String runJavaTrailCam(String configJson) {
        MessageQueue queue = getQueue(JAVA_TRAIL_CAM_QUEUE);
        JavaTrailCam.Config config = null;
        try {
            config = JavaTrailCam.Config.fromString(configJson);
        } catch (Exception e) {
            post(queue, "Failed to parse config: " + e.getMessage());
        }

        if (config != null) {
            post(queue, "Starting JavaTrailCam session for " + config.getStartClass() + "#" + config.getStartMethod());
            if (!config.getIncludePackages().isEmpty()) {
                post(queue, "Include packages: " + String.join(", ", config.getIncludePackages()));
            }
            if (!config.getExcludePackages().isEmpty()) {
                post(queue, "Exclude packages: " + String.join(", ", config.getExcludePackages()));
            }
        } else {
            post(queue, "Starting JavaTrailCam session");
        }

        JavaTrailCam cam = new JavaTrailCam();
        String json = cam.processUsingConfig(configJson);

        if (json == null || json.isEmpty()) {
            post(queue, "JavaTrailCam returned no data");
            return json;
        }

        post(queue, "JavaTrailCam session finished");
        publishTrace(queue, json);
        return json;
    }

    private void publishTrace(MessageQueue queue, String json) {
        if (json.startsWith("Exception")) {
            post(queue, json);
            return;
        }

        try {
            EntityTree.TreeEntity root = JsonHelper.parseObject("javaTrailCamTrace", json.trim()).getRoot();

            post(queue, "Trace completion reason: " + valueOf(root, "completionReason"));
            post(queue, "Trace timed out: " + valueOf(root, "timedOut"));
            post(queue, "Trace events: " + valueOf(root, "eventCount"));

            EntityTree.TreeEntity eventsNode = root.getChild("events");
            if (eventsNode != null) {
                for (EntityTree.TreeEntity event : eventsNode.getChildren()) {
                    String type = valueOf(event, "type");
                    String className = valueOf(event, "className");
                    String methodName = valueOf(event, "methodName");
                    String line = valueOf(event, "lineNumber");
                    post(queue, "Event " + type + " - " + className + "." + methodName + " @ line " + line);
                }
            }
        } catch (Exception e) {
            post(queue, "Failed to parse trace JSON: " + e.getMessage());
        }
    }

    private String valueOf(EntityTree.TreeEntity entity, String childName) {
        EntityTree.TreeEntity child = entity.getChild(childName);
        return child != null && child.getValue() != null ? child.getValue() : "";
    }

    private MessageQueue getQueue(String queueId) {
        MessageQueueManager queueManager = getController().getQueueManager();
        return queueManager.getQueue(queueId);
    }

    private void post(MessageQueue queue, String message) {
        if (queue != null) {
            queue.postMessage(message, OWNER);
        }
    }
}
