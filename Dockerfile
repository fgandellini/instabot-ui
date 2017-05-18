FROM ubuntu:17.04

LABEL name="instabot-ui" \
      version="0.0.1" \
      description="A Cycle.js UI for instabot.py."

RUN apt-get update && \
    apt-get install -y curl && \
    curl -sL https://deb.nodesource.com/setup_7.x | bash -

RUN apt-get update && apt-get install -y \
    python \
    python-pip \
    python-virtualenv \
    nodejs \
    git \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

RUN mkdir /instabot-ui
COPY . /instabot-ui

RUN cd /instabot-ui && \
    ./install-deps.sh && \
    rm -rf app/public && rm -rf app/src && rm -rf app/node_modules && rm -f .gitignore && rm -f package.json

WORKDIR /instabot-ui

EXPOSE 5000
CMD [ "./run.sh" ]
