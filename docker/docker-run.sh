#! /bin/bash

path=$(pwd)/target/changes

echo path = $path

# No Remote Debug
# docker run -d -p 1234:1234 -v "$path":/web/changes nikcross/openforum:$1

# With remote debug. Requires change to entrypoint.sh
docker run -d -p 1234:1234 -p 1066:1066 -v "$path":/web/changes nikcross/openforum:$1
