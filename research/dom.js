const puppeteer = require('puppeteer-core');
const fs = require('fs');
const sites = {
  clay: 'https://www.clay.com/',
  finsweet: 'https://www.finsweet.com/',
  wednesday: 'https://www.wednesday.is/',
  simform: 'https://www.simform.com/',
  vu: 'https://www.vu.co.uk/',
  vuquote: 'https://quote.vu.co.uk/',
  thoughtbot: 'https://thoughtbot.com/',
  factorynexus: 'https://factory-nexus.ai/',
};
const only = process.argv[2];
(async () => {
  const browser = await puppeteer.launch({executablePath:'/usr/bin/google-chrome', headless:'new', args:['--no-sandbox','--disable-gpu']});
  for (const [k,u] of Object.entries(sites)) {
    if (only && only!==k) continue;
    for (const vp of [{n:'desktop',w:1440,h:900,m:false},{n:'mobile',w:390,h:844,m:true}]) {
      const page = await browser.newPage();
      await page.setViewport({width:vp.w,height:vp.h,isMobile:vp.m,deviceScaleFactor:1,hasTouch:vp.m});
      let status=null;
      try {
        const resp = await page.goto(u,{waitUntil:'networkidle2',timeout:45000});
        status = resp && resp.status();
      } catch(e) { status='ERR '+e.message; }
      await new Promise(r=>setTimeout(r,2500));
      const data = await page.evaluate((H)=>{
        const vis = el=>{const r=el.getBoundingClientRect();const s=getComputedStyle(el);return r.width>0&&r.height>0&&r.top<H&&r.bottom>0&&s.visibility!=='hidden'&&s.display!=='none'&&s.opacity!=='0';};
        const txt = el=>(el.innerText||el.textContent||'').replace(/\s+/g,' ').trim();
        const h1s=[...document.querySelectorAll('h1')].map(e=>({t:txt(e),v:vis(e),top:Math.round(e.getBoundingClientRect().top)}));
        const h2s=[...document.querySelectorAll('h2')].slice(0,12).map(e=>({t:txt(e).slice(0,140),v:vis(e),top:Math.round(e.getBoundingClientRect().top+scrollY)}));
        const ctas=[...document.querySelectorAll('a,button')].filter(vis).map(e=>({tag:e.tagName,t:txt(e).slice(0,80),href:e.href||'',top:Math.round(e.getBoundingClientRect().top),left:Math.round(e.getBoundingClientRect().left)})).filter(x=>x.t);
        const ps=[...document.querySelectorAll('p,h2,h3,[class*=sub],[class*=lead]')].filter(vis).map(e=>({t:txt(e).slice(0,220),top:Math.round(e.getBoundingClientRect().top)})).filter(x=>x.t.length>15).slice(0,14);
        const vids=[...document.querySelectorAll('video')].map(v=>({vis:vis(v),src:(v.currentSrc||v.src||v.querySelector('source')?.src||'').slice(0,120),autoplay:v.autoplay,loop:v.loop,muted:v.muted,top:Math.round(v.getBoundingClientRect().top),paused:v.paused}));
        const iframes=[...document.querySelectorAll('iframe')].filter(vis).map(f=>f.src.slice(0,120));
        const imgs=[...document.querySelectorAll('img,svg')].filter(vis).map(e=>({alt:(e.getAttribute('alt')||e.getAttribute('aria-label')||'').slice(0,60),src:(e.currentSrc||'').slice(-60),top:Math.round(e.getBoundingClientRect().top)})).slice(0,40);
        return {title:document.title,h1s,h2s,ctas,ps,vids,iframes,imgs,bodyHeight:document.body.scrollHeight,
          forms:[...document.querySelectorAll('form,textarea,input[type=text],input[type=email]')].filter(vis).map(e=>e.tagName+':'+(e.placeholder||e.name||'')).slice(0,10)};
      }, vp.h);
      data.status=status; data.url=u; data.vp=vp.n;
      fs.writeFileSync(`dom/${k}_${vp.n}.json`, JSON.stringify(data,null,1));
      await page.screenshot({path:`dom/${k}_${vp.n}.png`});
      await page.close();
    }
    console.log('done',k);
  }
  await browser.close();
})();
