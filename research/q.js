const puppeteer=require('puppeteer-core');
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'new',args:['--no-sandbox']});
for(const [u,keys] of [['https://www.clay.com/',['Infrastructure to get any data','Trusted by more than','What do you want to build','Start free trial','Get a demo','Enrich directly']],['https://finsweet.com/',['We design and build websites','Expert Services','Watch our work','Dropbox transformed','What industry leaders say','Contact Sales']],['https://vu.co.uk/',['AWARD-WINNING','50+ businesses','SEND YOUR REQUIREMENT','What happens after']]]){
 const p=await b.newPage(); await p.setViewport({width:1440,height:900});
 try{await p.goto(u,{waitUntil:'domcontentloaded',timeout:40000});}catch(e){}
 await new Promise(r=>setTimeout(r,6000));
 const r=await p.evaluate((keys)=>{const out={};for(const k of keys){const els=[...document.querySelectorAll('body *')].filter(e=>e.children.length<=2&&(e.innerText||'').includes(k)&&(e.innerText||'').length<400);const e=els[els.length?els.length-1:0];if(e){const bb=e.getBoundingClientRect();out[k]={top:Math.round(bb.top+scrollY),txt:e.innerText.replace(/\s+/g,' ').slice(0,200)}}else out[k]=null}return out},keys);
 console.log(u,JSON.stringify(r,null,1)); await p.close();}
await b.close()})();
