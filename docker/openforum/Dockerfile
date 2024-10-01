FROM openjdk:17-alpine
MAINTAINER  Nik Cross <nikcross@wet-wired.com>


ENV JAVA_HOME="/usr/lib/jvm/default-jvm/"

# Has to be set explictly to find binaries
ENV PATH=$PATH:${JAVA_HOME}/bin

COPY ./source /web/source
COPY ./jetty /web/jetty

ADD entrypoint.sh /opt/entrypoint.sh
RUN chmod +x /opt/entrypoint.sh
CMD /opt/entrypoint.sh
