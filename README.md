# Swifty Dashboard

## Docker Setup
``` bash
# configure an API client
cp src/api/config.example.js src/api/config.js
vi src/api/config.js

# set up nginx
cp nginx.conf.example nginx.conf
vi nginx.conf

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

# Swifty Dashboard

© SwiftyCloud OU, 2018
