FROM anapsix/alpine-java:jre8
MAINTAINER  Nik Cross <nikcross@wet-wired.com>

COPY ./source /web/source
COPY ./jetty /web/jetty

ADD entrypoint.sh /start.sh
RUN chmod +x /start.sh
CMD ["/start.sh"]
