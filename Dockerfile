# Dependencies stage
FROM node:18-alpine AS deps
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install dependencies with optimizations
RUN npm install --no-audit --no-fund --prefer-offline --production=false

# Build stage
FROM node:18-alpine AS build
WORKDIR /app

# Define build argument for environment
ARG ENV=development

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./

# Copy only necessary project files
COPY public ./public
COPY src ./src
COPY .env.${ENV} ./.env
COPY webpack.config.js ./webpack.config.js
COPY craco.config.js ./craco.config.js

# Add build optimization environment variables
ENV NODE_OPTIONS="--max-old-space-size=2048"
ENV GENERATE_SOURCEMAP=false
ENV BABEL_ENV=production
ENV INLINE_RUNTIME_CHUNK=false
ENV CI=false

# Build the app with optimized settings
RUN npm run build:fast

# Production stage
FROM nginx:alpine

# Copy built files from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx configuration for client-side routing
COPY default.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
