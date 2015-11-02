#! /bin/bash

rm -rf target
mkdir target
mkdir target/source
mkdir target/jetty

cp -r openforum/* target
cp -r ../content/source/* target/source
cp -r ../content/jetty/* target/jetty
