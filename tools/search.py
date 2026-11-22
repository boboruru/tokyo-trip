"""搜尋 Wikimedia Commons 候選照片，下載縮圖並做成對照表供人工挑選。"""
import json, sys, io, time, urllib.parse, urllib.request
from pathlib import Path
from PIL import Image, ImageDraw

OUT = Path(sys.argv[1])
CAND = OUT / "cand"; CAND.mkdir(parents=True, exist_ok=True)
UA = {"User-Agent": "TripPagePhotoFetcher/1.0 (personal itinerary page)"}
API = "https://commons.wikimedia.org/w/api.php?"

Q = json.loads((OUT / "queries.json").read_text(encoding="utf-8"))

def get(url, tries=4):
    for i in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=40) as r:
                return r.read()
        except Exception as e:
            if i == tries - 1:
                raise
            time.sleep(3 * (i + 1))

def search(q, n):
    p = {"action": "query", "format": "json", "generator": "search", "gsrsearch": q + " filetype:bitmap",
         "gsrnamespace": 6, "gsrlimit": n, "prop": "imageinfo", "iiprop": "url|extmetadata|size",
         "iiurlwidth": 640}
    d = json.loads(get(API + urllib.parse.urlencode(p)))
    pages = sorted(d.get("query", {}).get("pages", {}).values(), key=lambda x: x.get("index", 0))
    return pages

meta = {}
for key, queries in Q.items():
    got = []
    for q in queries:
        try:
            for pg in search(q, 5):
                ii = pg["imageinfo"][0]
                if pg["title"] in [g["title"] for g in got]:
                    continue
                em = ii.get("extmetadata", {})
                got.append({"title": pg["title"], "thumb": ii["thumburl"], "page": ii["descriptionurl"],
                            "artist": em.get("Artist", {}).get("value", ""),
                            "license": em.get("LicenseShortName", {}).get("value", ""),
                            "w": ii.get("width"), "h": ii.get("height")})
        except Exception as e:
            print("search fail", key, q, e)
        time.sleep(0.5)
    got = got[:6]
    for i, g in enumerate(got):
        f = CAND / f"{key}_{i}.jpg"
        if not f.exists():
            try:
                im = Image.open(io.BytesIO(get(g["thumb"]))).convert("RGB")
                im.save(f, quality=85)
            except Exception as e:
                print("dl fail", key, i, e); g["fail"] = 1
            time.sleep(0.4)
        g["file"] = f.name
    meta[key] = got
    print(key, len(got))

(OUT / "meta.json").write_text(json.dumps(meta, ensure_ascii=False, indent=1), encoding="utf-8")

# 對照表：每個主題一列，最多 6 張
keys = list(meta)
for s in range(0, len(keys), 8):
    chunk = keys[s:s + 8]
    W, Hh = 6 * 210, len(chunk) * 170
    sheet = Image.new("RGB", (W, Hh), "white"); dr = ImageDraw.Draw(sheet)
    for r, k in enumerate(chunk):
        for c, g in enumerate(meta[k]):
            f = CAND / g["file"]
            if not f.exists():
                continue
            im = Image.open(f); im.thumbnail((200, 150))
            sheet.paste(im, (c * 210 + 5, r * 170 + 16))
            dr.text((c * 210 + 5, r * 170 + 2), f"{k}_{c}", fill="red")
    sheet.save(OUT / f"sheet_{s // 8}.jpg", quality=80)
print("done")
