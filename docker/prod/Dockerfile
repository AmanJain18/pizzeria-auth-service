# Use the official Node.js image as our base
FROM node:20-alpine as build
# NOTE: FROM node:lts-alpine

# Set the working directory inside the container 
WORKDIR /app

# COPY ["package.json", "package-lock.json*", "./"]
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of our app's source code into the container
COPY . .

# Build the app
RUN npm run build


# Start a new stage from the base image
FROM node:20-alpine as production

ENV NODE_ENV=production

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Install dependencies without devDependencies
RUN npm ci --ignore-scripts

# Copy the built app from the previous stage
COPY --from=build /app/dist ./dist

# Expose the port the app runs on
EXPOSE 5000

# Serve the app
CMD ["node", "dist/src/server.js"]


