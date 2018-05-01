#! /usr/bin/env bash

gunicorn --config gunicorn/gunicorn.conf --log-config gunicorn/logging.conf webApp:app