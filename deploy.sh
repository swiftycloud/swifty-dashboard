#!/bin/bash

npm install && npm run build && docker-compose build

echo "Deploy completed!"
