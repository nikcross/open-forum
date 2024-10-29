#! /bin/bash

cd ./open-forum
java -agentlib:jdwp=transport=dt_socket,server=y,suspend=y,address=1066 -jar open-forum.jar
