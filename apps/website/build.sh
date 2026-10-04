#!/bin/bash

mkdir -p apps/website/public

curl -L -o apps/website/public/755809946_17926162029385149_3739923509439876817_n.jpg \
https://raw.githubusercontent.com/pajarastudio/pajara-studio/b601b2042b8521f8b82613584d7e955c6163202b/apps/website/public/755809946_17926162029385149_3739923509439876817_n.jpg

curl -L -o apps/website/public/IMG_20261003_200614_720.jpg \
https://raw.githubusercontent.com/pajarastudio/pajara-studio/b601b2042b8521f8b82613584d7e955c6163202b/apps/website/public/IMG_20261003_200614_720.jpg

curl -L -o apps/website/public/IMG_20261003_200628_911.jpg \
https://raw.githubusercontent.com/pajarastudio/pajara-studio/b601b2042b8521f8b82613584d7e955c6163202b/apps/website/public/IMG_20261003_200628_911.jpg

curl -L -o apps/website/public/IMG_20261003_200706_317.jpg \
https://raw.githubusercontent.com/pajarastudio/pajara-studio/b601b2042b8521f8b82613584d7e955c6163202b/apps/website/public/IMG_20261003_200706_317.jpg

sed -i 's#"build": "next build"#"build": "rm -rf out \&\& next build"#' apps/website/package.json

pnpm --filter @pajara/website build
