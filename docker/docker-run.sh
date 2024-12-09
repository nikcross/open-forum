#! /bin/bash

path=$(pwd)/content

echo path = $path

# No Remote Debug
docker run -d -p 1234:1234 -p 4321:4321 -v "$path":/web/content nikcross/openforum:$1

# With remote debug. Requires change to entrypoint.sh
# docker run -d -p 1234:1234 -p 4321:4321 -p 1066:1066 -v "$path":/web/changes nikcross/openforum:$1
