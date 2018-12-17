# Swifty Dashboard

## Docker Setup
``` bash
# configure an API client
cp swifty.config.json.example swifty.config.json
vi swifty.config.json

# set up nginx
cp nginx.conf.example nginx.conf
vi nginx.conf

# copy default or your logo
cp static/logo.svg.example static/logo.svg
cp static/logo-white.svg.example static/logo-white.svg

# create volumes for certbot (if doesn't exists)
docker volume create certs
docker volume create certs-data

# run deploy script
./deploy.sh

# run or re-create docker container
docker-compose up -d
```

Now the application is available at http(s)://DOMAIN_NAME in the browser

## Or Manual Build Setup
``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report
```

## Push to GitLab Registry
docker login registry.gitlab.com
docker build -t registry.gitlab.com/swiftyteam/swifty-dashboard-v2 -f nginx.dockerfile .
docker push registry.gitlab.com/swiftyteam/swifty-dashboard-v2

# Swifty Dashboard

© SwiftyCloud OU, 2018
