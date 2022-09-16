FROM harbor.olympus.mtn/screamingbunny/docker/alpine-python3

LABEL name="JADN Lint" \
vendor="OpenC2" \
license="BSD" \
version="2.0" \
description="This is the JADN Lint container"

ADD requirements.txt /tmp/
ADD JADN-*-py2.py3-none-any.whl /tmp/
ADD webApp /opt/jadn_lint/webApp
ADD gunicorn /opt/jadn_lint/gunicorn

# Package installation
# Packages - https://pkgs.alpinelinux.org/packages
RUN apk add --no-cache \
    g++ gcc libxslt-dev \
    build-base \
    python3-dev \
    py3-lxml \
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
pip install /tmp/JADN-*-py2.py3-none-any.whl && \
# Cleanup
apk del build-base python3-dev && \
rm -rf /var/cache/apk/* *.tar.gz* /usr/src /root/.gnupg /tmp/*

# Ports
EXPOSE 8080/tcp

# Orchestrator Core Working Directory
WORKDIR /opt/jadn_lint/

# Persistant volume
VOLUME '/logs'

# Startup Command
CMD ["gunicorn", "--config", "gunicorn/gunicorn.conf.py", "--log-config", "gunicorn/logging.conf", "webApp:app"]
