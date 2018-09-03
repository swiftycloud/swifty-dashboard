#!/bin/bash

docker tag swifty-dashboard-v2_nginx swiftycloudou/ui && docker push swiftycloudou/ui

echo "Deploy completed!"
