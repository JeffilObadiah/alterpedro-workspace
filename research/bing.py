import urllib.parse, subprocess, sys, json, re, time
from bs4 import BeautifulSoup
qs = [
 "systems that don't talk to each other business",
 "website gets traffic but no leads",
 "team wastes time on manual reports",
 "want to use AI in my business but don't know where to start",
 "our software is old and everyone hates it",
 "i have an app idea but no technical team",
 "inventory in system doesn't match physical stock",
 "failed erp implementation what to do",
]
res={}
for q in qs:
    html=subprocess.run(["curl","-s","-L","-A","Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/150 Safari/537.36","-H","Accept-Language: en-US,en;q=0.9","https://www.bing.com/search?setlang=en&cc=US&q="+urllib.parse.quote(q)],capture_output=True,text=True).stdout
    s=BeautifulSoup(html,"html.parser")
    org=[]
    for li in s.select("li.b_algo")[:6]:
        a=li.select_one("h2 a")
        if a: org.append((a.get_text(" ",strip=True),a.get("href")))
    paa=[x.get_text(" ",strip=True) for x in s.select(".rwrap, .b_ans .df_qntext, .relatedQuestion, [data-tag='RelatedQnA'] .b_1linetrunc")][:8]
    rel=[x.get_text(" ",strip=True) for x in s.select("li.b_ans .b_rs a, .b_rs li a")][:10]
    res[q]={"organic":org,"paa":paa,"related":rel}
    time.sleep(1.5)
json.dump(res,open("bing.json","w"),indent=1)
for q,v in res.items():
    print("##",q)
    for o in v["organic"]: print("  ORG",o)
    print("  PAA",v["paa"]); print("  REL",v["related"])
