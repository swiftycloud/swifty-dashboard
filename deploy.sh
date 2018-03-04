#!/bin/bash

npm install && npm run build && rm -rf ./html && mv ./dist ./html && docker-compose restart

echo "Deploy completed!"
