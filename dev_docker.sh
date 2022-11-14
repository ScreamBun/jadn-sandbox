#!/usr/bin/env bash

# GUI Build
cd client
yarn
yarn build

# Container
IMG="jadn_webapp"

# Sync Built GUI Files
cd ../
rsync -avz --delete ./client/build/* ./server/webApp/static/
cp ./server/webApp/static/index.html ./server/webApp/templates/index.html

# Server Build
cd ./server
if [ "$(docker ps -aq --filter "name=$IMG")" != "" ]; then
  docker stop $IMG && docker rm -fv $IMG
fi

docker images -q $IMG 2>&1 >/dev/null
if [ $? -eq 0 ]; then
  docker rmi $IMG
fi

docker build -t $IMG -f Dockerfile .
docker run --name $IMG -p 8080:8080 $IMG
