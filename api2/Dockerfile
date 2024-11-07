# Use official Node.js image as base
FROM node:20

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the project files into the container
COPY . .

# Expose the port that the app will run on
EXPOSE 5001

# Command to run the API2 server
CMD ["node", "api2.js"]
