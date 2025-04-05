# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1 AS base

# install Node.js version 22
RUN apt-get update && apt-get install -y curl gnupg \
    && curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs

WORKDIR /usr/src/app

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install

RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
COPY prisma/ /temp/dev/prisma/
RUN cd /temp/dev && bun install --frozen-lockfile

RUN mkdir -p /temp/prod
COPY package.json bun.lock /temp/prod/
COPY prisma/ /temp/prod/prisma/
RUN cd /temp/prod && bun install --frozen-lockfile --production --ignore-scripts
RUN cd /temp/prod && bun run postinstall

FROM base AS prerelease

# Use the dev node_modules for the prerelease stage to have typescript and other required dependencies
COPY --from=install /temp/dev/node_modules ./node_modules
COPY . .

ARG AUTHORITY
ENV AUTHORITY=${AUTHORITY}

RUN bun run build

FROM base AS release

COPY --from=install /temp/prod/node_modules ./node_modules
COPY --from=prerelease /usr/src/app/.next ./.next
COPY --from=prerelease /usr/src/app/package.json ./

CMD ["bun", "run", "start"]

FROM base AS dev

# copy the installed dependencies from the install stage
COPY --from=install /temp/dev/node_modules node_modules
