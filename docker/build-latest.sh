#! /bin/bash

docker rm $(docker stop $(docker ps -a -q --filter ancestor=nikcross/openforum:latest --format="{{.ID}}"))
./update.sh
./build-and-run.sh latest
