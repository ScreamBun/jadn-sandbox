#!/usr/bin/env bash

# Lint
pylint --rcfile=.pylintrc --output-format=json webApp | pylint-json2html -o lint.html