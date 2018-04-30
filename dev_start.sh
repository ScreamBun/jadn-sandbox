#! /usr/bin/env bash

TAG_NAME=open_c2

docker build -t $TAG_NAME -f Dockerfile .

echo "\n\n"

docker run --rm --volume "$(pwd)/data":/data -p 8080:80 $TAG_NAME