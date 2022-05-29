#!/bin/bash

docker build -t auctionbot:latest .

docker stop auctionbot
docker rm auctionbot

docker run -v $(pwd):/usr/src/bot --restart=unless-stopped --name auctionbot -d auctionbot:latest
