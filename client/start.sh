#!/usr/bin/env bash

yarn 
yarn build
yarn start & python3 -m webbrowser http://localhost:3000/