#! /bin/bash

./update.sh
./docker-build.sh $1
./docker-run.sh $1