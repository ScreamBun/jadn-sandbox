#!/usr/bin/env bash

# GUI Build
cd client
yarn
yarn build

# Container
IMG="screambunn/jadn_sandbox:v1.0.0"
IMG_LATEST="screambunn/jadn_sandbox:latest"

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

docker login
docker build -f Dockerfile -t $IMG -t $IMG_LATEST  .
docker push $IMG
docker push $IMG_LATEST
