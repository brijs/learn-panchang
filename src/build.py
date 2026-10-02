import sys, os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
s=open('shell2.html').read()
app=open('data.js').read()+"\n"+open('core.js').read()+"\n"+open('scenes.js').read()+"\n"+open('planets.js').read()+"\n"+open('deep.js').read()+"\n"+open('new_d.js').read()+"\n"+open('new_d2.js').read()+"\n"+open('engine.js').read()+"\n"+open('menu_map.js').read()
astro=open('astro.js').read()
import json as _j, os as _o, base64 as _b
_vd={}
if _o.path.isdir('voice'):
    for _f in sorted(_o.listdir('voice')):
        if _f.endswith('.mp3'): _vd[_f[:-4]]=_b.b64encode(open('voice/'+_f,'rb').read()).decode()
app=app.replace('const VOICE_DATA = {/*VOICE*/};','const VOICE_DATA = '+_j.dumps(_vd)+';')
print('voice lines embedded:', len(_vd))
cdn='<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>'
inline='<script>'+open('three.min.js').read()+'</script>'
base=s.replace('/*ASTRO*/',astro).replace('/*APP*/',app)
open('panchang.html','w').write(base.replace('<!--THREE-->',cdn))
full=base.replace('<!--THREE-->',inline)
open('standalone.html','w').write('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>'+full+'</body></html>')
open('app_all.js','w').write(app)
open('../index.html','w').write(open('standalone.html').read())
print('wrote ../index.html')
