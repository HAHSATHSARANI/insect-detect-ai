FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

EXPOSE 5173

# Use --host to expose the server to the network
CMD ["npm", "run", "dev", "--", "--host"]

