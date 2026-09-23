# ==========================================
# STAGE 1 - BUILD ANGULAR
# ==========================================
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npx ng build --configuration production


# ==========================================
# STAGE 2 - NGINX
# ==========================================
FROM nginx:alpine

COPY --from=build /app/dist/sefaz-gateway-frontend/browser /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
