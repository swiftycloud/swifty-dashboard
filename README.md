# Swifty Dashboard

## Docker Setup
``` bash
# setting api client
cp src/api/config.example.js src/api/config.js
vi src/api/config.js

# run deploy script
./deploy.sh

# run docker container
docker-compose up -d
```

Now the application is available at http://localhost in the browser

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
# swifty-dashboard-new

(С)SwiftyCloud OU, 2018
