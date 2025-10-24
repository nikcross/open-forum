#!/bin/bash

# Script to run SampleApplication in continuous mode with debug enabled
# This allows JavaTrailCam to attach and trace the application

echo "Starting SampleApplication in continuous mode with debug on port 5005..."
echo "Press Ctrl+C to stop the application"
echo ""

cd "$(dirname "$0")"

# Compile test classes if needed
if [ ! -d "target/test-classes" ]; then
    echo "Compiling test classes..."
    mvn test-compile
    echo ""
fi

# Run with debug enabled and continuous mode
java -agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=5005 \
  -cp target/test-classes:target/classes \
  org.onestonesoup.openforum.javatrail.sample.SampleApplication --continuous
