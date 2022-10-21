#!/usr/bin/env bash

# GUI Build
cd client
npm install
npm run build

# Sync Built GUI Files
cd ../
rsync -avz --delete ./client/build/* ./server/webApp/static/
cp ./server/webApp/static/index.html ./server/webApp/templates/index.html

# Server Build
cd ./server
docker build -t jadn_webapp -f Dockerfile .

docker run --name jadn_webapp -p 8080:8080 jadn_webapp
