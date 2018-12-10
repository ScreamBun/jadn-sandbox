FROM gitlab.labs.g2-inc.net:4567/screamingbunny/docker/plus:alpine-python2

MAINTAINER Screaming_Bunny

LABEL name="JADN Lint" \
vendor="OpenC2" \
license="BSD" \
version="2.0" \
description="This is the JADN Lint container"

ADD requirements.txt /tmp/
ADD OpenC2-*-py2.py3-none-any.whl /tmp/
ADD webApp /opt/jadn_lint/webApp
ADD gunicorn /opt/jadn_lint/gunicorn

# Package installation
# Packages - https://pkgs.alpinelinux.org/packages
RUN apk add --no-cache \
    build-base \
    python-dev \
    py-lxml \
    libxslt-dev \
    # Pillow dependencies
    jpeg-dev \
    zlib-dev \
    freetype-dev \
    lcms2-dev \
    openjpeg-dev \
    tiff-dev \
    tk-dev \
    tcl-dev \
    harfbuzz-dev \
    fribidi-dev && \
#
# Logs folder
mkdir -p /logs/ && \
#
# Requirements install
pip install -r /tmp/requirements.txt && \
pip install --find-links=/tmp OpenC2 && \
# Cleanup
apk del build-base python-dev && \
rm -rf /var/cache/apk/* *.tar.gz* /usr/src /root/.gnupg /tmp/*

# Ports
EXPOSE 8080/tcp

# Orchestrator Core Working Directory
WORKDIR /opt/jadn_lint/

# Persistant volume
VOLUME '/logs'

# Startup Command
CMD ["gunicorn", "--config", "gunicorn/gunicorn.conf", "--log-config", "gunicorn/logging.conf", "webApp:app"]