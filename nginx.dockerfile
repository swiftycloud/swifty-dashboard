FROM nginx:latest
COPY ./dist /html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80 443
