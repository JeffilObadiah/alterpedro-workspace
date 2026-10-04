import puppeteer from '/home/box/.npm/_npx/0f94ee7615faf582/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js';
const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] });
const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => m.type()==='error' && errs.push(m.text()));
await p.goto('http://localhost:8787/');
await p.type('#answer', 'We need an app for our delivery drivers.');
await p.click('[data-start]');
await p.waitForSelector('.scan-question');
console.log('Q1:', await p.$eval('.scan-question', e => e.textContent));
await p.type('#answer', 'Jobs go out on WhatsApp and nobody can see which are late.');
await p.click('[data-start]');
await p.waitForFunction(() => document.querySelectorAll('.scan-question').length === 2);
await p.click('.row button.btn-ghost');
await p.waitForFunction(() => document.querySelectorAll('.scan-question').length === 3);
console.log('after IDK:', await p.$$eval('.scan-echo', e => e.at(-1).textContent), '|', await p.$$eval('.scan-question', e => e.at(-1).textContent));
console.log('covered:', await p.$$eval('[data-area][data-covered="true"]', e => e.map(x => x.dataset.area)));
// XSS check: server text is rendered by textContent
console.log('panel visible:', await p.$eval('[data-panel]', e => !e.hidden), 'errors:', errs);
await b.close();
