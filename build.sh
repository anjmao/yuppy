#!/bin/bash

# clean dist
rm -rf ./dist

# build ts to dist
node ./node_modules/typescript/bin/tsc

# copy package.json to dist
cp package.json ./dist/lib

# copy bin to dist
cp -R bin ./dist/lib