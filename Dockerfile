FROM alpine:3.6

MAINTAINER Prevalent_Development

LABEL name="WebValidator" \
vendor="OpenC2" \
license="BSD" \
description="This is the validator container for OpenC2"

# Package installation
# Packages - https://pkgs.alpinelinux.org/packages
RUN apk upgrade --update && \
apk add --no-cache bash \
    iputils \
    ca-certificates \
    shadow \
    tar \
    gnupg \
    python3 \
    build-base \
    libffi-dev \
    openssl-dev \
    python-dev \
    libffi \
    openssl && \
mkdir /data && \
# Python Config
python3 -m ensurepip && \
pip3 install --upgrade pip setuptools && \
# Cleanup
apk del gnupg && \
rm /var/cache/apk/* && \
rm -r /usr/lib/python*/ensurepip && \
rm -rf *.tar.gz* /usr/src /root/.gnupg /tmp/* && \
# Check versions
python3 --version && \
pip3 --version

# Copy & Config App
COPY webApp/ /opt/OpenC2/webApp/
COPY requirements.txt /opt/OpenC2/
COPY gunicorn/ /opt/OpenC2/gunicorn/
RUN pip3 install -r /opt/OpenC2/requirements.txt

# Websockets and Web UI
EXPOSE 80/tcp 443/tcp

# persist data
VOLUME /data

WORKDIR /opt/OpenC2/

CMD ["gunicorn", "--config", "gunicorn/gunicorn.conf", "--log-config", "gunicorn/logging.conf", "webApp:app"]
