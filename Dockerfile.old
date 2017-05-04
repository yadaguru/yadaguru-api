FROM ubuntu:14.04

MAINTAINER bobderrico80@gmail.com

ARG NODE_VERSION=4.x
ENV MY_BRANCH=master

RUN apt-get clean && \
    apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -yqq apt-transport-https \
                                                        ca-certificates \
                                                        curl \
                                                        git \
                                                        supervisor

RUN curl --fail -ssL -o /tmp/setup-nodejs https://deb.nodesource.com/setup_$NODE_VERSION && \
    bash /tmp/setup-nodejs && \
    DEBIAN_FRONTEND=noninteractive apt-get install -yq nodejs build-essential && \
    rm -rf /tmp/setup-nodejs

RUN git clone https://github.com/yadaguru/yadaguru-api.git /opt/yadaguru-api && \
    cd /opt/yadaguru-api && \
    npm install -g nodemon gulp-cli

RUN groupadd -r yadaguru && \
    useradd -r -g yadaguru yadaguru && \
    chown -R yadaguru: /opt/yadaguru-api && \
    apt-get --purge -yqq remove dpkg-dev g++ gcc libc6-dev make build-essential && \
    apt-get -yqq autoremove

COPY supervisord.conf /etc/supervisor/conf.d/
COPY entrypoint.sh /

RUN chmod a+x /entrypoint.sh

CMD ["/usr/bin/supervisord"]
