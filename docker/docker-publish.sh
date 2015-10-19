#! /bin/bash

echo "-> docker commit -m $3 -a Nik Cross "$2" nikcross/openforum:$1"
docker commit -m "$3" -a "Nik Cross" "$2" "nikcross/openforum:$1"
echo "-> docker push "nikcross/openforum:$1""
docker push "nikcross/openforum:$1"
