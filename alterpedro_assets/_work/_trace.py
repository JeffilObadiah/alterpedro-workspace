from PIL import Image
import numpy as np, subprocess
from scipy import ndimage as ndi
A=Image.open('/workspace/alterpedro_logo_v2.png').convert('RGBA').split()[3]
a=np.asarray(A)
lab,n=ndi.label(a>20,structure=np.ones((3,3)))
mark_ids=[1,2,6]
markmask=np.isin(lab,mark_ids)
# keep soft AA pixels near mark components: dilate by 2px and take alpha there excluding other comps' dilation
def sub(ids,pad):
    core=np.isin(lab,ids)
    d=ndi.binary_dilation(core,iterations=2)
    others=ndi.binary_dilation(~core&(lab>0),iterations=2)
    keep=d&~(others&~core)
    return np.where(keep,a,0).astype(np.uint8)
alphas={'full':a,'mark':sub(mark_ids,2)}
for k,al in alphas.items():
    ys,xs=np.where(al>20); box=(xs.min(),ys.min(),xs.max()+1,ys.max()+1)
    print(k,box)
    pad=8
    box=(max(0,box[0]-pad),max(0,box[1]-pad),min(a.shape[1],box[2]+pad),min(a.shape[0],box[3]+pad))
    c=Image.fromarray(al).crop(box)
    c.save(f'_{k}_alpha.png')
    big=c.resize((c.width*4,c.height*4),Image.BICUBIC)
    bw=big.point(lambda v:0 if v>127 else 255).convert('1')  # potrace traces black
    bw.save(f'_{k}.pbm')
    # scale so SVG units are source px: width in pt = srcpx*0.75*... use -r 
    subprocess.check_call(['potrace','-s','-t','4','-a','1.0','-O','0.4','-r','288','--tight','-o',f'logo-{k}.svg',f'_{k}.pbm'])
    open(f'_{k}_box.txt','w').write(str(box))
