#! /bin/bash

find ./source/ -name history -type d -exec rm -rf {} \;
find ./source/ -name *.zip -type f -exec rm -f {} \;
rm -rf ./source/OpenForum/Sandbox
rm -rf ./source/OpenForum/Journal
rm -rf ./source/OpenForum/MissingPages
rm -rf ./source/OpenForum/Deleted
rm -rf ./source/OpenForum/Temporary
echo "1234" > ./source/OpenForum/Users/Admin/password.txt
