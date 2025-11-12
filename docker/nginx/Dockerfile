FROM nginx:alpine

# Copiar configuración de nginx
COPY nginx.conf /etc/nginx/nginx.conf
COPY conf.d/ /etc/nginx/conf.d/

# Crear directorio para logs
RUN mkdir -p /var/log/nginx

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
