#!/usr/bin/env bash

clear

# GUI Build
cd client
yarn && yarn build
#yarn && yarn start

# Sync Built GUI Files
cd ../
rsync -avz --delete ./client/build/* ./server/webApp/static/
cp ./server/webApp/static/index.html ./server/webApp/templates/index.html

# Server Build
cd ./server
#clear
source ./start.sh