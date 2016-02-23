FROM node

MAINTAINER Stanislav Vetlovskiy <mrerliz@gmail.com>

VOLUME ["/tv"]

RUN mkdir /app
ADD . /app/
RUN cd /app && npm install --only=prod

EXPOSE 3000

CMD node /app/src/index.js -w
