#!/usr/bin/env bash

yarn 
yarn build
yarn start & python -m webbrowser http://localhost:3000/