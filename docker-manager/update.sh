#! /bin/bash

rm -rf target
mkdir target
mkdir target/changes
mkdir target/source
mkdir target/jetty

cp -r ../content/source/* target/source
cp -r ./content/* target/source
cp -r ../content/jetty/* target/jetty
cp ../content/*.sh target
