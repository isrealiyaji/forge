# Dev image: dependencies are installed once at build time; application code
# is bind-mounted in by docker-compose.yml at runtime, so editing a file on
# your host hot-reloads inside the container without rebuilding the image.
FROM node:24-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json
RUN npm install

WORKDIR /app/apps/web
EXPOSE 3000
# -H 0.0.0.0 (not the npm "dev" script) because Next's dev server otherwise
# may only listen inside this container — Docker's port mapping can't reach
# a server that isn't listening on all interfaces.
CMD ["npx", "next", "dev", "-H", "0.0.0.0"]
