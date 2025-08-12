# --- Build step ---
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
# Try npm ci, but fall back to npm install if lock is out of sync
RUN if [ -f package-lock.json ]; then \
      npm ci || (echo "npm ci failed, falling back to npm install" && npm install); \
    else npm install; \
    fi
COPY . .
RUN npm run build

# --- Serve step ---
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
