#! /bin/bash

find ./source/ -name history -type d -exec rm -rf {} \;
rm -rf ./source/OpenForum/Sandbox
rm -rf ./source/OpenForum/Journal
rm -rf ./source/OpenForum/MissingPages
rm -rf ./source/OpenForum/Deleted
rm -rf ./source/OpenForum/Temporary

