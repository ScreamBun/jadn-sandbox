FROM screambunn/alpine_python

LABEL name="JADN Sandbox" \
vendor="OpenC2" \
license="BSD" \
version="2.0" \
description="This is the JADN Sandbox container"

# Orchestrator Core Working Directory
WORKDIR /opt/jadn_sandbox/

ADD whls /opt/jadn_sandbox/whls
ADD requirements.txt /opt/jadn_sandbox
ADD webApp /opt/jadn_sandbox/webApp
ADD gunicorn /opt/jadn_sandbox/gunicorn

# Package installation
# Packages - https://pkgs.alpinelinux.org/packages
RUN apk add --no-cache \
    g++ \
    gcc \
    libxslt-dev \
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
    pango-dev \
    tiff-dev \
    tk-dev \
    tcl-dev \
    harfbuzz-dev \
    fribidi-dev \
    # Wheezyprint dependencies
    fontconfig \
    ttf-freefont \
    font-noto \
    terminus-font && \
    # Wheezyprint font config \
    fc-cache -f

# Logs folder
RUN mkdir -p /logs/ 


# Requirements install
RUN pip install -r ./requirements.txt
# RUN pip install ./$jadnschema
# RUN pip install ./$jadnxml

# Cleanup
RUN apk del build-base python3-dev && \
rm -rf /var/cache/apk/* *.tar.gz* /usr/src /root/.gnupg /tmp/*

ENV FLASK_ENV production

# Ports
EXPOSE 8082/tcp

# Persistant volume
VOLUME '/logs'

# Startup Command
CMD ["gunicorn", "-b", ":8082", "--config", "gunicorn/gunicorn.conf.py", "--log-config", "gunicorn/logging.conf", "webApp:app"]
