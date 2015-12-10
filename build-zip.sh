#! /bin/bash

rm -rf target

mkdir target
cp -rf ./docker/target/changes target
cp -rf ./docker/target/jetty target
cp -rf ./docker/target/source target

cd target
zip -r9 ../OpenForum.zip .

rm -rf target
