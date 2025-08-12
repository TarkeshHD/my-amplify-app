# --- Build step ---
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# If Amplify uses Vite/React: adjust to your build cmd
RUN npm run build

# --- Serve step ---
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
# optional: custom nginx.conf if you need SPA fallback
EXPOSE 80
