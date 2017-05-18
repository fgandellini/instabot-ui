# instabot-ui

A [Cycle.js](https://cycle.js.org) UI for the [instabot.py](https://github.com/instabot-py/instabot.py) bot. 

The app contains a [Node.js](https://nodejs.org) server that controls the bot (start/stop).

## Deploy

You can publish this project using [now](https://zeit.co/now). The instabot.py needs account data, you can set them using: 

```
now -e INSTABOT_UI_LOGIN=login -e INSTABOT_UI_PASSWORD=password
```

You can find more information about env variables in now [here](https://zeit.co/blog/environment-variables-secrets)

## Development

You need to install dependencies using the given bash script:

```
./install-deps.sh
```

Then you can start the server using `node server/server.js` and the frontend app in development mode `cd app && node start`.

### Requirements

* nodejs >= 7
* python
* pip
* virtualenv

## Test

```
cd app && node test
```