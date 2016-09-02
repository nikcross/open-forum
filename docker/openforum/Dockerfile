FROM openjdk:8-jre-alpine
MAINTAINER  Nik Cross <nikcross@wet-wired.com>

COPY ./source /web/source
COPY ./jetty /web/jetty

ADD entrypoint.sh /opt/entrypoint.sh
RUN chmod +x /opt/entrypoint.sh
CMD /opt/entrypoint.sh
