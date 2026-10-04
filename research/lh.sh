#!/bin/bash
export CHROME_PATH=/usr/bin/google-chrome
mkdir -p lh
for u in "https://www.clay.com/" "https://www.finsweet.com/" "https://www.wednesday.is/" "https://www.simform.com/" "https://www.vu.co.uk/" "https://thoughtbot.com/" "https://factory-nexus.ai/"; do
  n=$(echo $u | sed 's#https://##;s#[/.]#_#g')
  for i in 1 2; do
  npx lighthouse "$u" --preset=perf --form-factor=mobile --output=json --output-path=lh/${n}_run$i.json --chrome-flags="--headless=new --no-sandbox --disable-gpu" --quiet >lh/${n}_run$i.log 2>&1
  echo "$u run$i exit $?"
  done
done
echo DONE
