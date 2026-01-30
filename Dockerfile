# Use Node 22 runtime (LTS) as the base image
FROM node:22-alpine

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the application code
COPY . .

# Expose the port your Express app listens on
EXPOSE 8080

# Start the app
CMD ["npm", "start"]