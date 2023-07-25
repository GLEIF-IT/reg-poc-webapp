FROM node:18.16.0-alpine

RUN apk update
RUN apk add git

WORKDIR /app
COPY . /app/

# Upgrade yarn to a newer version to support rebuild
RUN yarn set version berry
# Install dependencies without building by source code
RUN yarn install --mode=skip-build
# Rebuild binaries (to avoid the weird issues on windows)
# This should be ok for the POC.
RUN yarn rebuild

EXPOSE 5173

ENTRYPOINT ["yarn", "run", "compose", "--host"]
