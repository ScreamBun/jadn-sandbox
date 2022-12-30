#!/usr/bin/env bash

curl -XPOST 'localhost:8080/validate' -H "Content-Type: application/json" --data @curl.json
