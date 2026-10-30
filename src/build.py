import json
u=open('ui.html').read();e=open('engine.js').read();d=json.load(open('art.json'))
out=u.replace('%%MANSION%%',open('mansion.js').read()).replace('%%ENGINE%%',e).replace('%%ART%%',json.dumps(d))
out='<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'+out;open('/tmp/claude-0/-home-claude/92316796-ec26-5ad5-a2ed-d9021aaba030/scratchpad/sny-17.html','w',encoding='utf-8').write(out)
import re;open('/tmp/claude-0/-home-claude/92316796-ec26-5ad5-a2ed-d9021aaba030/scratchpad/ui.js','w').write(re.findall(r'<script>(.*?)</script>',out,re.S)[1])
print(len(out.encode())//1024,'KB')