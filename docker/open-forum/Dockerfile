FROM java:openjdk-7-jre
MAINTAINER  Nik Cross <nikcross@wet-wired.com>

COPY ./open-forum /web/open-forum
COPY ./jetty /web/jetty

ADD entrypoint.sh /opt/entrypoint.sh
RUN chmod +x /opt/entrypoint.sh
CMD /opt/entrypoint.sh
