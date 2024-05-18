# Use the official Node.js image as our base
FROM node:20
# NOTE: FROM node:lts-alpine

# Sets an environment variable inside your Docker container.
ENV NODE_VER 20.12.2

# Set the working directory inside the container 
WORKDIR /usr/src/app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./
# COPY ["package.json", "package-lock.json*", "./"]

# Install app dependencies
RUN npm install --silent

# Copy the rest of our app's source code into the container
COPY . .

# Expose the port the app will run on
EXPOSE 5000

# The command to run our app when the container is running
CMD ["npm", "run", "dev"]

# Set the permissions for the app directory
# RUN chown -R node /usr/src/app

# Set the user to 'node'
# USER node





