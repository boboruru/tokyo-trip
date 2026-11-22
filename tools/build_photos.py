"""把挑好的 Commons 照片縮成 800px JPEG、轉 base64，寫進 index.html 的 PH。
用法：python build_photos.py <photos資料夾> <index.html>
choice.json：{"代號": [候選編號, 是否示意(0/1)], ...}
"""
import base64, html, io, json, re, sys, time, urllib.request
from pathlib import Path
from PIL import Image

D = Path(sys.argv[1]); HTML = Path(sys.argv[2])
meta = json.loads((D / "meta.json").read_text(encoding="utf-8"))
choice = json.loads((D / "choice.json").read_text(encoding="utf-8"))
UA = {"User-Agent": "TripPagePhotoFetcher/1.0 (personal itinerary page)"}
BIG = D / "big"; BIG.mkdir(exist_ok=True)

def get(url):
    for i in range(4):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=40) as r:
                return r.read()
        except Exception:
            if i == 3:
                raise
            time.sleep(4 * (i + 1))

def plain(s):
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", "", s or ""))).strip()

PH = {}; total = 0
for key, (idx, generic) in choice.items():
    m = meta[key][idx]
    f = BIG / f"{key}.jpg"
    if not f.exists():
        raw = None
        try:
            raw = get(m["thumb"].replace("/640px-", "/800px-"))
        except Exception:
            raw = get(m["thumb"])
        f.write_bytes(raw); time.sleep(0.5)
    im = Image.open(f).convert("RGB"); im.thumbnail((800, 800))
    buf = io.BytesIO(); im.save(buf, "JPEG", quality=70, optimize=True, progressive=True)
    b = buf.getvalue(); total += len(b)
    artist = plain(m["artist"])[:80] or "作者不詳"
    PH[key] = {"s": "data:image/jpeg;base64," + base64.b64encode(b).decode(), "c": f'{artist}｜{m["license"]}',
               "u": m["page"], "g": int(generic)}
    print(key, len(b) // 1024, "KB")

js = "<script>var PH=" + json.dumps(PH, ensure_ascii=False, separators=(",", ":")) + ";</script>"
s = HTML.read_text(encoding="utf-8")
s2, n = re.subn(r"<script>var PH=.*?;</script>", lambda _: js, s, count=1, flags=re.S)
assert n == 1, "找不到 PH 佔位"
HTML.write_text(s2, encoding="utf-8", newline="\n")
print("images", len(PH), "total", total // 1024, "KB", "html", len(s2.encode()) // 1024, "KB")
