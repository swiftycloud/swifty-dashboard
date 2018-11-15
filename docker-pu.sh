#!/bin/bash

echo "To docker hub: \n"

docker build -t swiftycloudou/ui -f nginx.dockerfile .
docker push swiftycloudou/ui

echo "To gitlab registry: \n"

docker build -t registry.gitlab.com/swiftyteam/swifty-dashboard-v2 -f nginx.dockerfile .
docker push registry.gitlab.com/swiftyteam/swifty-dashboard-v2

echo "Completed!"
