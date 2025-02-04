FROM osgeo/gdal:alpine-small-3.0.4 as builder
WORKDIR /app

LABEL maintainer="Kristofor Carle <kris@maphubs.com>"

ENV NODE_ENV=production

RUN apk add --no-cache --upgrade nodejs npm yarn git python make gcc g++ zip postgresql-dev

COPY package.json yarn.lock /app/
RUN npm config set '@bit:registry' https://node.bitsrc.io && \
    yarn --production --pure-lockfile && \
    yarn global add modclean && \
    yarn run modclean

COPY ./src /app/src
COPY ./pages /app/pages
COPY ./.next /app/.next
COPY .babelrc next.config.js server.js server.es6.js docker-entrypoint.sh version.json theme.less /app/

FROM osgeo/gdal:alpine-small-3.0.4
ENV NODE_ENV=production
WORKDIR /app
RUN apk add --no-cache --upgrade nodejs
COPY --from=builder /app .

RUN chmod +x /app/docker-entrypoint.sh && \
    mkdir -p css && mkdir -p /app/temp/uploads

VOLUME ["/app/temp/uploads"]
VOLUME ["/app/logs"]

EXPOSE 4000

CMD /app/docker-entrypoint.sh
