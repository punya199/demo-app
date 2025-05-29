FROM docker.io/node:20.18.3-alpine3.21 AS builder

ARG VITE_APP_VERSION
ENV VITE_APP_VERSION=$VITE_APP_VERSION

RUN echo "VITE_APP_VERSION: $VITE_APP_VERSION"

ENV YARN_CACHE_FOLDER=/root/.yarn

WORKDIR /usr/src/app

RUN corepack enable \
  && yarn set version berry \
  && yarn config set nodeLinker node-modules \
  && yarn

COPY package.json .
COPY yarn.lock .
COPY .yarnrc.yml ./
COPY .yarn/ ./.yarn/

RUN --mount=type=cache,target="$YARN_CACHE_FOLDER" YARN_CACHE_FOLDER="$YARN_CACHE_FOLDER" yarn install

COPY . .

RUN yarn build

FROM nginx:stable-alpine AS runner

COPY --from=builder /usr/src/app/dist /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
