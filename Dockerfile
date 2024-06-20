# Stage 1: Build TypeScript app
FROM node:lts-alpine AS build

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy app source
COPY . .

# Build TypeScript app
RUN npm run build

# Stage 2: Run the app in a lightweight container
FROM node:lts-alpine

WORKDIR /app

# Set MongoDB URL directly (replace with your actual MongoDB URL)
ENV MONGO_URL=mongodb://mongodb:27017/mydatabase

# Copy built JavaScript files from previous stage
COPY --from=build /app/dist ./dist
COPY package*.json ./

# Install production dependencies (if any)
RUN npm install --only=prod

# Expose port
EXPOSE 3000

# Command to run the app
CMD ["node", "dist/index.js"]
