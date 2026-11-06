FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
ENV NODE_ENV=production
EXPOSE 5000
USER node
HEALTHCHECK CMD wget -qO- http://localhost:5000/api/health || exit 1
CMD ["node", "server.js"]
