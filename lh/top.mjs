import puppeteer from '/home/box/.npm/_npx/0f94ee7615faf582/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js';
const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] });
for (const u of process.argv.slice(2)) {
  const p = await b.newPage(); await p.setViewport({ width: 412, height: 823, isMobile: true, deviceScaleFactor: 1.75 });
  await p.goto(u, { waitUntil: 'networkidle0' });
  console.log(u, 'what-you-get top =', await p.$eval('#what-you-get', e => Math.round(e.getBoundingClientRect().top + scrollY)), 'hero rowH =', await p.$eval('.row', e => Math.round(e.getBoundingClientRect().height)));
}
await b.close();
