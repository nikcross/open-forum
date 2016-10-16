#! /bin/bash

cd ../server
mvn clean install
cd ../content
rm jetty/webapps/root/WEB-INF/lib/*.jar
cp ../server/target/*-jar-with-dependencies.jar jetty/webapps/root/WEB-INF/lib
