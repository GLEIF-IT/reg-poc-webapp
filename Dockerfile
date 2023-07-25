FROM node:18.16.0-alpine

WORKDIR /app
COPY ./package.json ./yarn.lock ./

# Upgrade yarn to a newer version to support rebuild
# Install dependencies without building by source code
RUN apk update \
    && apk add git \
    && yarn set version berry \
    && yarn install --mode=skip-build

COPY . ./

# Rebuild binaries (to avoid the weird issues on windows)
# This should be ok for the POC.
RUN yarn rebuild

EXPOSE 5173

ENTRYPOINT ["yarn", "run", "compose", "--host"]
