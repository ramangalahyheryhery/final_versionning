FROM node:18-alpine
WORKDIR /usr/src/app

COPY package*.json ./

# Installation dépendances
RUN npm ci --only=production

COPY . .

#(user)non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

RUN chown -R nodejs:nodejs /usr/src/app
USER nodejs

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

# Démarrer l'application
CMD ["node", "server.js"]
