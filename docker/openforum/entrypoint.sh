#!/bin/sh

cd /web/open-forum

# With remote debug and suspend until remote debugger connected
#java -agentlib:jdwp=transport=dt_socket,server=y,suspend=y,address=1066 -jar open-forum.jar

# With remote debug
java -agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=1066 -jar open-forum.jar

# Without remote debug
#java -jar open-forum.jar

