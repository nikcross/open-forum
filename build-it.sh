#! /bin/bash

cd ~/git/onestonesoup/Core
mvn clean install

cd ~/git/open-forum/javascript
mvn clean install
mvn assembly:assembly -DdescriptorId=jar-with-dependencies

cd ~/git/open-forum/server
mvn clean install
mvn assembly:assembly -DdescriptorId=jar-with-dependencies

cd ~/git/open-forum/base
# maven needs to create archive of content

