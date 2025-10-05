#! /bin/bash

./update.sh
./docker-build.sh
docker login -u=nikcross -p=$2
docker push nikcross/openforum:$1
