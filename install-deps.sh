#!/bin/sh

cd ./server
git clone https://github.com/instabot-py/instabot.py.git
virtualenv venv
. venv/bin/activate
pip install -r instabot.py/requirements.txt
deactivate
npm install

cd ../app
npm install
npm run build

cd ..
