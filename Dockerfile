# Production image: serve the prebuilt static dashboard.
# It deliberately contains no Node/npm install step, so deployment is not
# affected by npm/network behavior on the target Docker host.
FROM nginx:alpine

# Copy custom Nginx configuration with CORS proxy support
COPY nginx.conf /etc/nginx/conf.d/default.conf

# The production bundle is generated and committed with the application.
COPY dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
