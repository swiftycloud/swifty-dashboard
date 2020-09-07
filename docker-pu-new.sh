#!/bin/bash

echo "============== To gitlab registry:"

docker build -t registry.gitlab.com/bbelky/swifty-dashboard-v3 -f nginx.dockerfile .
docker push registry.gitlab.com/bbelky/swifty-dashboard-v3

echo "============== Completed!"
