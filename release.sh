#!/bin/bash
git pull
node ./node_modules/standard-version/bin/cli.js --infile ../CHANGELOG.md
./build.sh

git push --follow-tags origin master

read -p "Press enter to release to npm" npm
cp README.md ./dist
cd ./dist
yarn publish --access=public