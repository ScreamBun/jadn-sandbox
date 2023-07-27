#!/bin/bash 

set -e

if [ "$#" -ne 2 ]
then
  echo "Version arguments not supplied, see docker_push.py"
  exit 1
fi

prev_version=$1
echo "prev docker version: $prev_version"

new_version=$2
echo "new docker version: $new_version"

# GUI Build
cd client
yarn
yarn build

# Container
PREV_IMG="screambunn/jadn_sandbox:$prev_version"
NEW_IMG="screambunn/jadn_sandbox:$new_version"
IMG_LATEST="screambunn/jadn_sandbox:latest"

# Sync Built GUI Files
cd ../
rsync -avz --delete ./client/build/* ./server/webApp/static/
cp ./server/webApp/static/index.html ./server/webApp/templates/index.html

# Stop and remove previous image
cd ./server
if [ "$(docker ps -aq --filter "name=$PREV_IMG")" != "" ]; then
  docker stop $PREV_IMG && docker rm -fv $PREV_IMG
fi

docker images -q $PREV_IMG 2>&1 >/dev/null
if [ $? -eq 1 ]; then
  docker rmi $PREV_IMG
fi

# Build and push new image
docker login
docker build -f Dockerfile -t $NEW_IMG  .
docker push $NEW_IMG
docker build -f Dockerfile -t $IMG_LATEST  .
docker push $IMG_LATEST
