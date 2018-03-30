#!/bin/bash
git pull

# uddate changelog
node ./node_modules/standard-version/bin/cli.js --infile ./CHANGELOG.md

# build lib to dist
TAG=$(git describe --abbrev=0 --tags)
sed -i "" "s|<VERSION>|${TAG}|" ./lib/cli.ts
./build.sh

# and push tags
git push --follow-tags origin master

# push to npm
read -p "Press enter to release to npm" npm
cd ./dist
yarn publish --access=public