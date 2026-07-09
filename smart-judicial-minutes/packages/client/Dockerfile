# ---- Build stage ----
FROM node:20-alpine AS build
WORKDIR /app

# Copy every workspace manifest so npm can resolve the workspace graph.
COPY package.json package-lock.json* ./
COPY tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/
COPY packages/server/package.json packages/server/
COPY packages/client/package.json packages/client/
RUN npm install --include-workspace-root \
  --workspace @smj/shared --workspace @smj/client

COPY packages/shared packages/shared
COPY packages/client packages/client
RUN npm run build --workspace @smj/shared \
  && npm run build --workspace @smj/client

# ---- Runtime stage (static hosting via nginx) ----
FROM nginx:1.27-alpine AS runtime
COPY packages/client/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/packages/client/dist /usr/share/nginx/html
EXPOSE 8080
