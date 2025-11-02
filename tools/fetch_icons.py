# A simple script to fetch app icons (og:image) from Play Store and App Store pages.
# Saves images to assets/img/projects/<slug>.png and overwrites existing files.
# Silent operation (no verbose prints).


import os
import re
import requests
from urllib.parse import urlparse
from bs4 import BeautifulSoup


BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) if __file__ else '.'
OUT_DIR = os.path.join(BASE_DIR, 'assets', 'img', 'projects')
STORE_DIR = os.path.join(BASE_DIR, 'assets', 'img', 'store')


os.makedirs(OUT_DIR, exist_ok=True)

projects = {
'octothink': 'https://play.google.com/store/apps/details?id=com.absolutelydigital.octothink&hl=en',
'gravity_bottle_flip': 'https://play.google.com/store/apps/details?id=com.absolutelydigital.gravitybottleflip&hl=en',
'asmr_hospital_doctor': 'https://play.google.com/store/apps/details?id=com.playnation.asmr.satisfying.doctor.games&hl=en&gl=US',
'dentist_inc': 'https://play.google.com/store/apps/details?id=com.taprix.dentist.hospital.inc.doctor.games&hl=en_US',
'surgery_doctor_simulator': 'https://play.google.com/store/apps/details?id=com.taprix.er.emergency.hospital.surgery.simulator.doctor.games&hl=en&gl=US',
'nail_salon': 'https://play.google.com/store/apps/details?id=com.taprix.nail.salon.art.makeover.games',
'toy_run': 'https://apps.apple.com/us/app/perfect-smash-inc/id1492444212',
'perfect_smash_inc': 'https://apps.apple.com/us/app/perfect-smash-inc/id1491310769',
'extreme_traffic_police_bike': 'https://apps.apple.com/us/app/extreme-traffic-police-bike/id1117836268',
'ray_of_hope': 'https://www.youtube.com/watch?v=rOxSa7hD_8o',
'miners_io': 'https://www.youtube.com/watch?v=DrKKEIgzWFM&feature=youtu.be',
'defend_the_dice': 'https://osamasarfraz.itch.io/defend-the-dice',
'ray_flex': 'https://osamasarfraz.itch.io/ray-flex-in-a-murky-space',
'spades_with_friends': 'https://play.google.com/store/apps/details?id=com.spadeswithfriendsllc.spadesgame&hl=en'
}

HEADERS = {'User-Agent': 'Mozilla/5.0 (compatible; PortfolioIconFetcher/1.0)'}


def download_image(url, out_path):
    try:
        resp = requests.get(url, headers=HEADERS, timeout=20)
        if resp.status_code == 200:
            with open(out_path, 'wb') as f:
                f.write(resp.content)
            return True
    except Exception:
     return False
    return False

def fetch_play_icon(page_url):
# Play Store pages usually include a meta property og:image with an icon url
    try:
        r = requests.get(page_url, headers=HEADERS, timeout=20)
        if r.status_code != 200:
            return None
        soup = BeautifulSoup(r.text, 'html.parser')
        og = soup.find('meta', property='og:image')
        if og and og.get('content'):
            return og['content']
    except Exception:
        return None
    return None

def fetch_appstore_icon(page_url):
    try:
        r = requests.get(page_url, headers=HEADERS, timeout=20)
        if r.status_code != 200:
            return None
        soup = BeautifulSoup(r.text, 'html.parser')
        og = soup.find('meta', property='og:image')
        if og and og.get('content'):
            return og['content']
    except Exception:
        return None
    return 

def fetch_youtube_thumbnail(youtube_url):
    # YouTube thumbnail pattern
    m = re.search(r'v=([A-Za-z0-9_-]{6,})', youtube_url)
    if not m:
        # try short url
        parsed = urlparse(youtube_url)
        if parsed.path:
            vid = parsed.path.strip('/')
            if vid:
                return f'https://img.youtube.com/vi/{vid}/hqdefault.jpg'
        return None
    vid = m.group(1)
    return f'https://img.youtube.com/vi/{vid}/hqdefault.jpg'

def fetch_itchio_thumbnail(itch_url):
    try:
        r = requests.get(itch_url, headers=HEADERS, timeout=20)
        if r.status_code != 200:
            return None
        soup = BeautifulSoup(r.text, 'html.parser')
        # itch.io uses og:image for thumbnails too
        og = soup.find('meta', property='og:image')
        if og and og.get('content'):
            return og['content']
    except Exception:
        return None
    return 

for slug, link in projects.items():
    out_file = os.path.join(OUT_DIR, f"{slug}.png")
    image_url = None
    if 'play.google.com' in link:
        image_url = fetch_play_icon(link)
    elif 'apps.apple.com' in link:
        image_url = fetch_appstore_icon(link)
    elif 'youtube.com' in link or 'youtu.be' in link:
        image_url = fetch_youtube_thumbnail(link)
    elif 'itch.io' in link:
        image_url = fetch_itchio_thumbnail(link)


    if image_url:
        download_image(image_url, out_file)
    else:
        # fallback: create a simple placeholder (1x1 transparent png) to avoid missing files
        from PIL import Image
        img = Image.new('RGBA', (200,200), (0,0,0,0))
        img.save(out_file)

# Also ensure store icon placeholders exist (play-circle.png, app-circle.png, youtube-circle.png, itchio-circle.png)
os.makedirs(STORE_DIR, exist_ok=True)
# If not present, create minimal placeholders (you can replace them with nicer assets later)
for name in ['play-circle.png','app-circle.png','youtube-circle.png','itchio-circle.png']:
    p = os.path.join(STORE_DIR, name)
    if not os.path.exists(p):
        from PIL import Image, ImageDraw
        im = Image.new('RGBA', (200,200), (0,0,0,0))
        draw = ImageDraw.Draw(im)
        draw.ellipse((10,10,190,190), fill=(124,58,237,255))
        im.save(p)