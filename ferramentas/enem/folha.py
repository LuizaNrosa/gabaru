import sys
from PIL import Image
d,out,*ns=sys.argv[1:]
import glob
ims=[]
for n in ns:
    f=sorted(glob.glob(f"{d}/*-q{int(n):03d}.png"))[0]
    ims.append(Image.open(f))
w=560; ims=[i.resize((w,max(1,int(i.height*w/i.width)))) if i.width>w or True else i for i in ims]
ims=[i.crop((0,0,w,min(i.height,900))) for i in ims]
H=max(i.height for i in ims); S=Image.new("RGB",((w+8)*len(ims),H),"#888")
for k,i in enumerate(ims): S.paste(i,(k*(w+8),0))
S.save(out)
