#! /bin/bash

find ./changes/ -name history -type d -exec rm -rf {} \;
rm -rf ./changes/OpenForum/Sandbox
rm -rf ./changes/OpenForum/Journal
rm -rf ./changes/OpenForum/MissingPages
rm -rf ./changes/OpenForum/Deleted
rm -rf ./changes/OpenForum/Temporary
