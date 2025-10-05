#! /bin/bash

find ./changes/ -name history -type d -exec rm -rf {} \;
find ./changes/ -name *.zip -type f -exec rm -f {} \;
rm -rf ./changes/OpenForum/Sandbox
rm -rf ./changes/OpenForum/Journal
rm -rf ./changes/OpenForum/MissingPages
rm -rf ./changes/OpenForum/Deleted
rm -rf ./changes/OpenForum/Temporary
echo "1234" > ./changes/OpenForum/Users/Admin/password.txt
