# Use an official Node.js image to build the frontend assets
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Use an official Nginx image to serve the static files
FROM nginx:alpine


# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf


# Copy built assets from the build stage
COPY --from=build /app/out /usr/share/nginx/html

# Copy custom nginx config if you have one
# COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]