import json,glob,os,re
rows={}
for f in sorted(glob.glob('lh/*.json')):
    d=json.load(open(f))
    a=d['audits']
    print('FILE',f,'runtimeError',d.get('runtimeError'))
    g=lambda k:a.get(k,{}).get('numericValue')
    key=re.sub(r'_run\d\.json','',os.path.basename(f))
    r=dict(lcp=(g('largest-contentful-paint') or 0)/1000, fcp=(g('first-contentful-paint') or 0)/1000,
      tbt=g('total-blocking-time'), cls=g('cumulative-layout-shift'),
      si=(g('speed-index') or 0)/1000, perf=(d['categories']['performance']['score'] or -1)*100,
      kb=(g('total-byte-weight') or 0)/1024, reqs=len(a['network-requests']['details']['items']),
      time=d['fetchTime'], ver=d['lighthouseVersion'], final=d['finalDisplayedUrl'], warn=d.get('runWarnings',[])[:2],
      lcpel=(a.get('largest-contentful-paint-element',{}).get('details',{}).get('items',[{}])[0].get('items',[{}])[0].get('node',{}).get('snippet','') if a.get('largest-contentful-paint-element',{}).get('details') else '')[:90])
    rows.setdefault(key,[]).append(r)
for k,v in rows.items():
    print(k)
    for r in v: print('  ',{x:(round(y,2) if isinstance(y,float) else y) for x,y in r.items()})
