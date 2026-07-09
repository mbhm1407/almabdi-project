# ---- Build stage ----
FROM node:20-alpine AS build
WORKDIR /app

# Install workspace dependencies using the root lockfile.
COPY package.json package-lock.json* ./
COPY tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/
COPY packages/server/package.json packages/server/
RUN npm install --workspaces --include-workspace-root

# Copy sources and build shared + server.
COPY packages/shared packages/shared
COPY packages/server packages/server
RUN npm run build --workspace @smj/shared \
  && npm run build --workspace @smj/server

# ---- Runtime stage ----
FROM node:20-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app

COPY package.json package-lock.json* ./
COPY packages/shared/package.json packages/shared/
COPY packages/server/package.json packages/server/
RUN npm install --workspaces --include-workspace-root --omit=dev

COPY --from=build /app/packages/shared/dist packages/shared/dist
COPY --from=build /app/packages/server/dist packages/server/dist

USER node
EXPOSE 3978
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://localhost:3978/health/live').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "packages/server/dist/index.js"]
