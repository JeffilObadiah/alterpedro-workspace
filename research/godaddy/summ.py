import json,glob,statistics as st
for n in ('home','builder'):
    rows=[]
    for f in sorted(glob.glob(f'{n}_run?.json')):
        d=json.load(open(f)); a=d['audits']; g=lambda k:a.get(k,{}).get('numericValue')
        items=a['network-requests']['details']['items']
        js=sum(i.get('transferSize',0) for i in items if i.get('resourceType')=='Script')
        jsres=sum(i.get('resourceSize',0) for i in items if i.get('resourceType')=='Script')
        le=a.get('largest-contentful-paint-element',{}).get('details',{})
        el=''
        try: n0=le['items'][0]['items'][0]['node']; el=n0.get('snippet','')[:160]+' | '+n0.get('selector','')
        except Exception: pass
        r=dict(f=f,final=d['finalDisplayedUrl'],time=d['fetchTime'],err=d.get('runtimeError'),warn=d.get('runWarnings'),lcp=g('largest-contentful-paint'),cls=g('cumulative-layout-shift'),tbt=g('total-blocking-time'),
          fcp=g('first-contentful-paint'),si=g('speed-index'),tbw=g('total-byte-weight'),js=js,jsres=jsres,reqs=len(items),perf=d['categories']['performance']['score'],lcpel=el,
          scriptTreeJS=None)
        rows.append(r); print(r)
    for k in ('lcp','cls','tbt','fcp','tbw','js','jsres','reqs','perf'):
        v=[r[k] for r in rows if r[k] is not None]
        print(n,'MEDIAN',k,st.median(v) if v else None, v)
