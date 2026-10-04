import cairosvg, io, numpy as np
from PIL import Image
from scipy import ndimage as ndi
S=4
for k in ('full','mark'):
    src=Image.open(f'_{k}_alpha.png'); big=src.resize((src.width*S,src.height*S),Image.BICUBIC)
    sa=np.asarray(big)>127
    svg=open(f'logo-{k}.svg').read()
    import re
    w=float(re.search(r'width="([\d.]+)"',svg).group(1)); h=float(re.search(r'height="([\d.]+)"',svg).group(1))
    png=cairosvg.svg2png(bytestring=svg.encode(),output_width=round(w*S),output_height=round(h*S),background_color='white')
    r=np.asarray(Image.open(io.BytesIO(png)).convert('L'))<128
    ys,xs=np.where(sa); oy,ox=ys.min(),xs.min()
    full=np.zeros_like(sa); hh=min(r.shape[0],sa.shape[0]-oy); ww=min(r.shape[1],sa.shape[1]-ox)
    full[oy:oy+hh,ox:ox+ww]=r[:hh,:ww]
    inter=(full&sa).sum(); uni=(full|sa).sum()
    diff=full^sa
    d_src=ndi.distance_transform_edt(~sa); d_svg=ndi.distance_transform_edt(~full)
    dist=np.maximum(d_src[full].max(), d_svg[sa].max())/S
    print(k,'svg size',w,h,'IoU',round(inter/uni,5),'xor px %',round(100*diff.sum()/sa.sum(),3),'max edge dev (src px)',round(dist,2),'95th pct dev', round(np.percentile(np.concatenate([d_src[full],d_svg[sa]]),99.9)/S,2))
    # save overlay: red = src only, blue = svg only
    ov=np.full(sa.shape+(3,),255,np.uint8); ov[sa&full]=(0,0,0); ov[sa&~full]=(255,0,0); ov[~sa&full]=(0,90,255)
    Image.fromarray(ov).save(f'_overlay_{k}.png')
    # component counts
    nc=ndi.label(sa)[1]; ns=ndi.label(full)[1]; print(' components src/svg',nc,ns, 'paths',svg.count('<path'),'holes via M count',svg.count('M'))
    bad=(diff)&((d_src>0.5*S)|(d_svg>0.5*S))
    lb,nb=ndi.label(ndi.binary_dilation(bad,iterations=6))
    out=[]
    for i,sl in enumerate(ndi.find_objects(lb),1):
        out.append((int(((lb==i)&bad).sum()),sl[1].start//S,sl[0].start//S))
    print(' >0.5px dev clusters (npx@4x, x, y in crop px):',sorted(out,reverse=True)[:8], 'total',len(out))
