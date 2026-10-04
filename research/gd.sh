#!/bin/bash
export PATH=/workspace/tools/node-v22.23.3-linux-x64/bin:$PATH
export CHROME_PATH=/usr/bin/google-chrome
cd /workspace/research
for p in "home|https://www.godaddy.com/" "builder|https://www.godaddy.com/websites/website-builder"; do
 n=${p%%|*}; u=${p#*|}
 for i in 1 2 3; do
  npx lighthouse "$u" --preset=perf --form-factor=mobile --output=json --output-path=godaddy/${n}_run$i.json --chrome-flags="--headless=new --no-sandbox --disable-gpu" --quiet >godaddy/${n}_run$i.log 2>&1
  echo "$n run$i exit $? $(date)"
 done
done
echo DONE
