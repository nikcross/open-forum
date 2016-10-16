#! /bin/bash

echo building and updateing jar
cd ../content
./update-jar.sh

cd ../docker
echo deleting old target directory
rm -rf target

echo createing new target directory
mkdir target
mkdir target/source
mkdir target/jetty

echo copying openforum to target
cp -r openforum/* target

echo copying openforum source to target
cp -r ../content/source/* target/source

echo copying openforum jetty to target
cp -r ../content/jetty/* target/jetty

echo done
