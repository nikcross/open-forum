#! /bin/bash

cd ../server
mvn clean install
cd ../content
cp ../server/target/*-jar-with-dependencies.jar jetty/webapps/root/WEB-INF/lib
