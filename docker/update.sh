#! /bin/bash

echo "Updating from "
pwd

rm -rf target
mkdir target
mkdir target/source
mkdir target/open-forum

cp ../server/target/*with-dependencies.jar ./open-forum/open-forum.jar

cp -r openforum/* target
cp -r open-forum/* target/open-forum
cp -r ../content/source/* target/source
