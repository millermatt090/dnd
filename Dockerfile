# ---- Build the Angular front end (project root) ----
FROM node:24-alpine AS client-build
WORKDIR /build
COPY package.json package-lock.json ./
RUN npm ci
COPY angular.json tsconfig.json tsconfig.app.json ./
COPY src ./src
RUN npm run build

# ---- Build the TypeScript server ----
FROM node:24-alpine AS server-build
WORKDIR /build/server
COPY server/package.json server/package-lock.json ./
RUN npm ci
COPY server/ ./
RUN npm run build && npm prune --omit=dev

# ---- Runtime: compiled server + built front end only ----
FROM node:24-alpine
WORKDIR /srv
ENV NODE_ENV=production \
    PORT=8000 \
    CLIENT_DIR=/srv/client
COPY --from=server-build /build/server/package.json ./
COPY --from=server-build /build/server/node_modules ./node_modules
COPY --from=server-build /build/server/dist ./dist
COPY --from=client-build /build/dist/client/browser ./client
USER node
EXPOSE 8000
CMD ["node", "dist/main.js"]
