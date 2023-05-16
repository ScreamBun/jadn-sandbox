#!/usr/bin/env bash

curl -XPOST 'localhost:8082/validate' -H "Content-Type: application/json" --data @curl.json
