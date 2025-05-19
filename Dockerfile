FROM node:22-alpine

# Install dependencies needed for development
RUN apk add --no-cache libc6-compat

# Set working directory
WORKDIR /app

# Copy dependency files
COPY package.json package-lock.json ./

# Install all dependencies (not --legacy-peer-deps unless needed)
RUN npm install

# Copy source files
COPY . .

# Set environment variables for development
ENV NODE_ENV=development
ENV NEXT_PUBLIC_ENVIRONMENT=development
ENV NEXT_PUBLIC_GA_TRACKING_ID='UA-166014216-1'
ENV NEXT_PUBLIC_BASE_URL='/backend/api'

# Expose dev port
EXPOSE 3000

# Start Next.js in development mode
CMD ["npm", "run", "dev"]
