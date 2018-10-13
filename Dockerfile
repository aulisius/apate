FROM node:10 as build
WORKDIR /app
COPY package.json /app
RUN npm install
COPY . /app
RUN npm run production

FROM nginx:alpine as deploy
EXPOSE 80
COPY --from=build /app/dist/output /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf