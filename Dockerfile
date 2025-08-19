# -------- Stage 1: Build the Vite app --------
FROM node:18-alpine AS build
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code and build
COPY . .
RUN npm run build

# -------- Stage 2: Serve using Vite preview --------
FROM node:18-alpine
WORKDIR /app

# Reinstall only prod dependencies (optional for safety)
COPY package*.json ./
RUN npm install --omit=dev

# Copy built files
COPY --from=build /app/dist ./dist

# Expose the port Vite preview uses (default 4173)
EXPOSE 4173

# Serve the built app using Vite's preview command
CMD ["npx", "vite", "preview", "--host"]
