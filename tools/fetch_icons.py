import os, re, requests
from urllib.parse import urlparse
from bs4 import BeautifulSoup
from PIL import Image, ImageDraw

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(BASE_DIR, 'assets', 'img', 'projects')
STORE_DIR = os.path.join(BASE_DIR, 'assets', 'img', 'store')
os.makedirs(OUT_DIR, exist_ok=True)
os.makedirs(STORE_DIR, exist_ok=True)

HEADERS = {'User-Agent':'Mozilla/5.0 (PortfolioFetcher)'}
projects = {
  'spades_with_friends':'https://play.google.com/store/apps/details?id=com.spadeswithfriendsllc.spadesgame&hl=en'
}

def fetch_icon(url):
    try:
        r=requests.get(url,headers=HEADERS,timeout=20)
        s=BeautifulSoup(r.text,'html.parser')
        tag=s.find('meta',property='og:image')
        return tag['content'] if tag else None
    except: return None

for slug,link in projects.items():
    out=os.path.join(OUT_DIR,f'{slug}.png')
    img_url=fetch_icon(link)
    if img_url:
        r=requests.get(img_url,headers=HEADERS)
        open(out,'wb').write(r.content)
    else:
        im=Image.new('RGBA',(200,200),(0,0,0,0))
        d=ImageDraw.Draw(im)
        d.ellipse((10,10,190,190),fill=(124,58,237,255))
        im.save(out)
