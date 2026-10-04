import puppeteer from '/home/box/.npm/_npx/0f94ee7615faf582/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js';
const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] });
for (const [w, h] of [[360, 740], [412, 823], [768, 1024], [1280, 800]]) {
  const p = await b.newPage(); await p.setViewport({ width: w, height: h, isMobile: w < 700, deviceScaleFactor: 1 });
  await p.evaluateOnNewDocument(() => { window.__ls = []; new PerformanceObserver(l => { for (const e of l.getEntries()) window.__ls.push({ v: e.value, sources: e.sources.map(s => s.node && (s.node.id || s.node.className || s.node.nodeName)) }); }).observe({ type: 'layout-shift', buffered: true }); });
  await p.goto('http://localhost:8787/', { waitUntil: 'networkidle0' });
  const top = () => p.$eval('#what-you-get', e => Math.round(e.getBoundingClientRect().top + scrollY));
  const t0 = await top();
  // chip
  await p.click('[data-chip]'); const val = await p.$eval('#answer', e => e.value); const focused = await p.evaluate(() => document.activeElement.id);
  await p.click('[data-start]'); await p.waitForSelector('.scan-question');
  const t1 = await top();
  let n = 1;
  for (let i = 0; i < 6; i++) { await p.type('#answer', 'Some answer with enough words to count here.'); await p.click('[data-start]'); n++; await p.waitForFunction(k => document.querySelectorAll('.scan-echo').length >= k, {}, n); }
  const t2 = await top();
  const st = await p.$eval('[data-stage]', e => { const c = e.clientHeight; e.style.height = 'auto'; const nat = e.clientHeight; e.style.height = ''; return { client: c, scroll: e.scrollHeight, natural: nat }; });
  const ls = await p.evaluate(() => window.__ls);
  console.log(`${w}x${h}: top before=${t0} after1=${t1} after7=${t2} | chip value="${val}" focus=${focused} | stage client=${st.client} scroll=${st.scroll} natural(after 7 turns)=${st.natural} | CLS entries=${JSON.stringify(ls)}`);
  if (w === 412) await p.screenshot({ path: '/workspace/lh/flow-412.png', fullPage: false });
  await p.close();
}
await b.close();
