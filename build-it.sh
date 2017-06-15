#! /bin/bash

cd ~/os-git/onestonesoup/Core
mvn clean install

cd ~/os-git/open-forum/javascript
mvn clean install
mvn assembly:assembly -DdescriptorId=jar-with-dependencies

cd ~/os-git/open-forum/server
mvn clean install
mvn assembly:assembly -DdescriptorId=jar-with-dependencies

#cd ~/os-git/open-forum/base
# maven needs to create archive of content

