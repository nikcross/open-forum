#! /bin/bash

cd target

pwd

docker build -t nikcross/openforum:$1 .
