const puppeteer = require('puppeteer-core'); const fs=require('fs');
const sites={home:'https://www.godaddy.com/',builder:'https://www.godaddy.com/websites/website-builder'};
(async()=>{
 const browser=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'new',args:['--no-sandbox','--disable-gpu']});
 for(const [k,u] of Object.entries(sites)) for(const vp of [{n:'desktop',w:1440,h:900,m:false},{n:'mobile',w:390,h:844,m:true}]){
  const page=await browser.newPage(); await page.setViewport({width:vp.w,height:vp.h,isMobile:vp.m,hasTouch:vp.m,deviceScaleFactor:1});
  await page.evaluateOnNewDocument(()=>{window.__lcp=[];new PerformanceObserver(l=>{for(const e of l.getEntries())window.__lcp.push({t:Math.round(e.startTime),tag:e.element&&e.element.tagName,cls:e.element&&String(e.element.className).slice(0,80),url:e.url,size:e.size,txt:e.element&&(e.element.innerText||'').slice(0,100),id:e.id})}).observe({type:'largest-contentful-paint',buffered:true});});
  let status; const reqs=[];
  page.on('response',r=>{const ct=r.headers()['content-type']||''; if(/video|mpegurl/.test(ct)||/\.(mp4|webm|m3u8)/.test(r.url()))reqs.push(r.url().slice(0,150))});
  try{const r=await page.goto(u,{waitUntil:'networkidle2',timeout:60000});status=r&&r.status();}catch(e){status='ERR '+e.message}
  await new Promise(r=>setTimeout(r,3000));
  const H=vp.h;
  const data=await page.evaluate((H)=>{
   const vis=el=>{const r=el.getBoundingClientRect();const s=getComputedStyle(el);return r.width>0&&r.height>0&&r.top<H&&r.bottom>0&&s.visibility!=='hidden'&&s.display!=='none'&&s.opacity!=='0'};
   const txt=el=>(el.innerText||el.textContent||'').replace(/\s+/g,' ').trim();
   return {url:location.href,title:document.title,lcp:window.__lcp,
    h1s:[...document.querySelectorAll('h1')].map(e=>({t:txt(e),v:vis(e),top:Math.round(e.getBoundingClientRect().top)})),
    h2s:[...document.querySelectorAll('h2')].slice(0,10).map(e=>({t:txt(e).slice(0,120),v:vis(e),top:Math.round(e.getBoundingClientRect().top+scrollY)})),
    ctas:[...document.querySelectorAll('a,button')].filter(vis).map(e=>({tag:e.tagName,t:txt(e).slice(0,80),href:(e.href||'').slice(0,100),top:Math.round(e.getBoundingClientRect().top),left:Math.round(e.getBoundingClientRect().left)})).filter(x=>x.t),
    ps:[...document.querySelectorAll('p,h2,h3')].filter(vis).map(e=>({t:txt(e).slice(0,220),top:Math.round(e.getBoundingClientRect().top)})).filter(x=>x.t.length>12).slice(0,14),
    vids:[...document.querySelectorAll('video')].map(v=>({vis:vis(v),src:(v.currentSrc||v.src||'').slice(0,140),autoplay:v.autoplay,loop:v.loop,muted:v.muted,paused:v.paused,top:Math.round(v.getBoundingClientRect().top)})),
    lottie:document.querySelectorAll('lottie-player,[class*=lottie],canvas').length,
    animatedCss:[...document.querySelectorAll('body *')].filter(vis).filter(e=>{const s=getComputedStyle(e);return (s.animationName&&s.animationName!=='none')}).slice(0,15).map(e=>({tag:e.tagName,cls:String(e.className).slice(0,60),anim:getComputedStyle(e).animationName,dur:getComputedStyle(e).animationDuration})),
    animations:document.getAnimations().length,
    imgs:[...document.querySelectorAll('img,picture')].filter(vis).slice(0,12).map(e=>({alt:(e.alt||'').slice(0,60),src:(e.currentSrc||'').slice(0,120),top:Math.round(e.getBoundingClientRect().top)})),
    cookie:[...document.querySelectorAll('[id*=cookie i],[class*=consent i],[id*=onetrust i]')].filter(vis).map(e=>txt(e).slice(0,200)).slice(0,3)}
  },H);
  data.status=status;data.mediaReqs=reqs;
  fs.writeFileSync(`godaddy/dom_${k}_${vp.n}.json`,JSON.stringify(data,null,1));
  await page.screenshot({path:`godaddy/dom_${k}_${vp.n}.png`});
  // timeline: frames over load for movement
  await page.close(); console.log('done',k,vp.n,status);
 }
 await browser.close();})();
