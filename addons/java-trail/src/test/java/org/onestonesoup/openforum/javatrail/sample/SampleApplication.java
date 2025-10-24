package org.onestonesoup.openforum.javatrail.sample;

import org.onestonesoup.openforum.javatrail.sample.domain.DomainWorkflow;

public class SampleApplication {

    public static void main(String[] args) throws InterruptedException {
        // Check for continuous mode flag
        boolean continuous = false;
        for (String arg : args) {
            if ("--continuous".equals(arg) || "-c".equals(arg)) {
                continuous = true;
                break;
            }
        }

        System.out.println("Sample application started with continuous mode = " + continuous);

        new SampleApplication().run(continuous);
    }

    public void run() throws InterruptedException {
        // Default behavior - single run (for existing tests)
        run(false);
    }

    public void run(boolean continuous) throws InterruptedException {
        //Allow debugger to attach before the entry point executes
        Thread.sleep(200);

        if (continuous) {
            System.out.println("Running in continuous mode. Press Ctrl+C to stop.");
            int iteration = 0;
            while (true) {
                iteration++;
                System.out.println("\n=== Iteration " + iteration + " ===");
                entryPoint();
                // Wait between iterations to allow trace observation
                Thread.sleep(2000);
            }
        } else {
            // Original single-run behavior (for tests)
            entryPoint();
            //Keep the JVM alive briefly so the tracer can collect exit events
            Thread.sleep(200);
        }
    }

    public void entryPoint() {
        DomainWorkflow workflow = new DomainWorkflow();
        workflow.executeWorkflow();
    }
}
