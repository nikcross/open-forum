#!/bin/sh

cd /web/jetty

# With remote debug and suspend until remote debugger connected
#java -agentlib:jdwp=transport=dt_socket,server=y,suspend=y,address=1066 -jar start.jar

# With remote debug
java -agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=1066 -jar start.jar

# Without remote debug
#java -jar start.jar

