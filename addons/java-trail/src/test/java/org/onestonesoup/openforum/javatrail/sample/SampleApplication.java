package org.onestonesoup.openforum.javatrail.sample;

import org.onestonesoup.openforum.javatrail.sample.domain.DomainWorkflow;

public class SampleApplication {

    public static void main(String[] args) throws InterruptedException {
        new SampleApplication().run();
    }

    public void run() throws InterruptedException {
        //Allow debugger to attach before the entry point executes
        Thread.sleep(200);
        entryPoint();
        //Keep the JVM alive briefly so the tracer can collect exit events
        Thread.sleep(200);
    }

    public void entryPoint() {
        DomainWorkflow workflow = new DomainWorkflow();
        workflow.executeWorkflow();
    }
}
