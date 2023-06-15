#!/usr/bin/env bash

# Container
IMG="screambunn/jadn_sandbox:latest"

# docker login
docker run --rm -p 8082:8082 $IMG
