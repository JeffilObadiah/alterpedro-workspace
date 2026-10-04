const puppeteer = require('puppeteer-core');
const urls = {
 wednesday:'https://www.wednesday.is/engineering-case-studies/whatsapp-chatbot-to-place-and-track-orders-for-a-leading-lens-manufacturer-in-asia',
 simform:'https://www.simform.com/case-studies/last-mile-delivery-platform-cuts-manual-status-calls-by-30-with-azure-migration/',
 thoughtbot:'https://thoughtbot.com/case-studies/closeknit-health',
 vu:'https://vu.co.uk/our-work',
 hex:'https://www.clay.com/customers/hex',
 finsweet:'https://finsweet.com/portfolio/dropbox',
 dyn:'https://www.dynamicyield.com/article/gated-content-debate-deflated/'
};
(async()=>{
 const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'new',args:['--no-sandbox']});
 for(const [k,u] of Object.entries(urls)){
  const p=await b.newPage(); await p.setViewport({width:1440,height:900});
  try{ await p.goto(u,{waitUntil:'domcontentloaded',timeout:40000}); await new Promise(r=>setTimeout(r,4000)); }catch(e){console.log(k,'ERR',e.message)}
  const d=await p.evaluate(()=>{const t=e=>(e.innerText||'').replace(/\s+/g,' ').trim();
   return {title:document.title,heads:[...document.querySelectorAll('h1,h2,h3')].map(e=>e.tagName+': '+t(e).slice(0,110)).filter(x=>x.length>6).slice(0,40),
   nums:[...document.querySelectorAll('body *')].filter(e=>e.children.length==0&&/^[+\-]?\d[\d,.]*\s?(%|x|X|k|M|\+|hrs?|days?)/.test(t(e))&&t(e).length<40).map(t).slice(0,12),
   ctas:[...document.querySelectorAll('a,button')].map(t).filter(x=>/talk|contact|book|demo|start|consult|get|quote|requirement/i.test(x)&&x.length<50).slice(0,10),
   len:document.body.innerText.length, text:document.body.innerText.slice(0,200)}});
  console.log('=====',k,u); console.log(JSON.stringify(d,null,1));
  if(k==='dyn') require('fs').writeFileSync('dy_text.txt',await p.evaluate(()=>document.body.innerText));
  await p.close();
 }
 await b.close();
})();
