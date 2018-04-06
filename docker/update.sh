#! /bin/bash

rm -rf target
mkdir target
mkdir target/source
mkdir target/jetty

./update-jar.sh

cp -r openforum/* target
cp -r ../content/source/* target/source
cp -r jetty/* target/jetty
