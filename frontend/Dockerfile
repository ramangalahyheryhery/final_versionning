# Utiliser une image Nginx légère
FROM nginx:alpine

# Installer curl 
RUN apk add --no-cache curl

COPY . /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80

# Vérification de santé
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O - http://localhost:3000/ || exit 1


CMD ["nginx", "-g", "daemon off;"]
