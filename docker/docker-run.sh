#! /bin/bash

path=$(pwd)/target/changes

# No Remote Debug
# docker run -d -p 1234:1234 -v /web/application:$path nikcross/openforum:$1

# With remote debug. Requires change to entrypoint.sh
docker run -d -p 1234:1234 -p 1066:1066 -v /web/application:$path nikcross/openforum:$1
