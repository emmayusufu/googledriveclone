FROM node:22-alpine

RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

ENV NODE_ENV=development
ENV NEXT_PUBLIC_ENVIRONMENT=development
ENV NEXT_PUBLIC_GA_TRACKING_ID='UA-166014216-1'
ENV NEXT_PUBLIC_BASE_URL='/backend/api'

EXPOSE 3000

CMD ["npm", "run", "dev"]
