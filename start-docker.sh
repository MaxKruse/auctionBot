#!/bin/bash

docker build -t auctionbot:latest .

docker run -v $(pwd):/usr/src/bot --restart=unless-stopped --name auctionbot -d auctionbot:latest
