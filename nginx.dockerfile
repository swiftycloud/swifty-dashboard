FROM nginx:latest
COPY ./dist /html
COPY ./nginx.conf /etc/nginx/conf.d
EXPOSE 80 443