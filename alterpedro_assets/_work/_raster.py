from PIL import Image
import numpy as np, os
O='/workspace/alterpedro_assets/'
def mk(alpha_img, w, name, color):
    h=round(alpha_img.height*w/alpha_img.width)
    al=alpha_img.resize((w,h),Image.LANCZOS)
    rgba=Image.new('RGBA',(w,h),color+(0,)); rgba.putalpha(al)
    return rgba
for k,wl in (('full',(640,1280)),('mark',(512,))):
    al=Image.open(f'_{k}_alpha.png')
    for w in wl:
        for tag,col in (('',(0,0,0)),('-light',(0xF5,0xF5,0xF2))):
            im=mk(al,w,k,col)
            base=f'logo-{k}{"-"+str(w) if k=="full" else ""}{tag}'
            im.save(O+base+'.webp','WEBP',lossless=True,method=6,exact=True)
            im.save(O+base+'.q.webp','WEBP',quality=92,alpha_quality=100,method=6,exact=True)
            print(base,im.size,os.path.getsize(O+base+'.webp'),os.path.getsize(O+base+'.q.webp'))
