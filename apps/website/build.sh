#!/bin/bash

mkdir -p apps/website/public

curl -L "https://raw.githubusercontent.com/pajarastudio/pajara-studio/main/apps/website/public/755809946_17926162029385149_3739923509439876817_n.jpg" -o apps/website/public/755809946_17926162029385149_3739923509439876817_n.jpg

curl -L "https://raw.githubusercontent.com/pajarastudio/pajara-studio/main/apps/website/public/IMG_20261003_200614_720.jpg" -o apps/website/public/IMG_20261003_200614_720.jpg

curl -L "https://raw.githubusercontent.com/pajarastudio/pajara-studio/main/apps/website/public/IMG_20261003_200628_911.jpg" -o apps/website/public/IMG_20261003_200628_911.jpg

curl -L "https://raw.githubusercontent.com/pajarastudio/pajara-studio/main/apps/website/public/IMG_20261003_200706_317.jpg" -o apps/website/public/IMG_20261003_200706_317.jpg

sed -i 's#"build": "next build"#"build": "rm -rf out \&\& next build"#' apps/website/package.json

pnpm --filter @pajara/website build

cp apps/website/public/robots.txt apps/website/out/robots.txt
cp apps/website/public/sitemap.xml apps/website/out/sitemap.xml
