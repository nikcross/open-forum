#! /bin/bash

cd ./jetty
java -agentlib:jdwp=transport=dt_socket,server=y,suspend=y,address=1066 -jar start.jar
