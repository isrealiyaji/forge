# Dev image: dependencies are installed once at build time; application code
# is bind-mounted in by docker-compose.yml at runtime, so editing a file on
# your host hot-reloads inside the container without rebuilding the image.
FROM node:24-alpine

WORKDIR /app

# npm workspaces resolves the dependency graph from the root package.json's
# "workspaces" field, which lists apps/web too — its package.json has to be
# present for `npm install` to succeed even though this image only runs the API.
COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json
RUN npm install

WORKDIR /app/apps/api
EXPOSE 4000
CMD ["npm", "run", "dev"]
