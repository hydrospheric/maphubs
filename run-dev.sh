#!/bin/sh

./load-dev-env.sh

DEBUG="maphubs:*,maphubs-error:*" nodejs-dashboard -- node -r nodejs-dashboard --max-old-space-size=2048 src/app.js