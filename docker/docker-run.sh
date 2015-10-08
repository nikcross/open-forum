# No Remote Debug
# docker run -d -p 80:80 -v /web/application:/web/application nikcross/openforum:$1

# With remote debug. Requires change to entrypoint.sh
docker run -d -p 80:80 -p 1066:1066 -v /web/application:/web/application nikcross/openforum:$1
