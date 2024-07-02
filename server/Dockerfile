FROM ubuntu:22.04

LABEL name="JADN Sandbox" \
vendor="OpenC2" \
license="BSD" \
version="2.0" \
description="This is the JADN Sandbox container"

# JADN Sandbox Working Directory
WORKDIR /opt/jadn_sandbox/

ADD whls /opt/jadn_sandbox/whls
ADD requirements.txt /opt/jadn_sandbox
ADD webApp /opt/jadn_sandbox/webApp
ADD gunicorn /opt/jadn_sandbox/gunicorn
ADD cbor_files /opt/jadn_sandbox/

RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y \
        git \
        openssl \
        python3 \
        python3-pip \
        python3-cffi \
        python3-brotli \
        libpango-1.0-0 \
        libpangoft2-1.0-0 \
        ruby \
        rsync \
        && \
    apt-get clean

# Ruby Gem
RUN gem install cbor-diag

# Logs folder
RUN mkdir -p /logs/ 

# Requirements install
RUN pip install --no-cache-dir -r requirements.txt

ENV FLASK_ENV production

# Ports
EXPOSE 8082/tcp

# Persistant volume
VOLUME '/logs'

# Startup Command
CMD ["gunicorn", "-b", ":8082", "--config", "gunicorn/gunicorn.conf.py", "--log-config", "gunicorn/logging.conf", "webApp:app"]
