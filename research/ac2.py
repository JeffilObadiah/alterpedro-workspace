import urllib.parse, urllib.request, json, time
stems = [
 "systems not talking","systems don't talk","apps not syncing","how to connect different software","software doesn't integrate with","integrate crm and erp","disconnected systems","data silos in my business",
 "website traffic but no","website visitors but no","website not generating leads","website not converting","why am i getting no enquiries",
 "manual reporting","automate reports","automate excel reports","stop copying data between spreadsheets","too much manual data entry",
 "how can ai help my business","how to start using ai","ai for small business where to start","ai consultant for","ai readiness",
 "outdated software","replace legacy","legacy system modernization","software my team hates","hate our software","switch from legacy software",
 "i have an idea for an app","app idea no developer","how to build software without a developer","find a technical cofounder","build an mvp without",
 "inventory mismatch","inventory not matching","inventory numbers wrong","stock mismatch","inventory management problems",
 "erp failed","erp implementation failure","our erp is a mess","erp failure","what to do after failed erp",
 "custom software vs off the shelf","business problem solving consultant","hire someone to fix my business process"]
out={}
for s in stems:
    try:
        u="https://suggestqueries.google.com/complete/search?client=firefox&hl=en&q="+urllib.parse.quote(s)
        r=urllib.request.urlopen(urllib.request.Request(u,headers={"User-Agent":"Mozilla/5.0"}),timeout=15).read().decode()
        out[s]=json.loads(r)[1]
    except Exception as e:
        out[s]=["ERR "+str(e)]
    time.sleep(0.4)
json.dump(out,open("ac2.json","w"),indent=1)
for k,v in out.items(): print("##",k,"=>",v)
