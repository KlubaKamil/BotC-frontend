#docker buildx build --platform linux/arm64 -t 192.168.1.19:30500/botc-frontend:latest --push  .

FROM node:24 AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build --configuration=production

FROM nginx:alpine
COPY --from=build /app/dist/botc-frontend/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80 443