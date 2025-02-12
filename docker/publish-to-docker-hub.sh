#! /bin/bash

./update.sh
./docker-build.sh
docker login -u=nikcross -p=$1
docker push nikcross/openforum:5.0.7
