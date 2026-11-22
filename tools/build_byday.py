"""從 index.html 組出「依天分」版 by-day.html。
共用：<head> 與 CSS、插畫、小動物、照片 PH、資料陣列、工具函式。
換掉：導覽列、頁面骨架、分頁邏輯（tools/byday_tail.js）。
用法：python tools/build_byday.py   （在專案根目錄執行）
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
src = (ROOT / "index.html").read_text(encoding="utf-8")
tail = (ROOT / "tools" / "byday_tail.js").read_text(encoding="utf-8")

def cut(s, a, b):
    i = s.index(a); j = s.index(b, i)
    return s[i:j]

head = src[:src.index("<body>")]
head = head.replace("<title>東京趴趴走｜1/28–2/5</title>", "<title>東京趴趴走（依天分）｜1/28–2/5</title>")
extra_css = """
/* 依天分版 */
nav a.dn{text-align:center;line-height:1.2;padding:2px 12px}nav a.dn small{display:block;font-size:11px}
#dayh{font-size:22px;margin:2px 2px 10px}#dayh .pill{font-size:15px;vertical-align:3px}#dayh small{display:block;font-size:14px;margin-top:2px}
.sub-tabs{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;padding:2px 2px 14px;margin:0 -2px}
.sub-tabs::-webkit-scrollbar{display:none}
.stab{flex:none;font-size:15px;color:var(--ink);background:var(--paper);border:3px solid var(--ink);border-radius:999px;padding:2px 14px;text-decoration:none;-webkit-tap-highlight-color:transparent}
.stab[aria-current=page]{background:var(--c2);animation:pop .45s cubic-bezier(.3,1.6,.5,1)}
.stab.mute{border-style:dashed;opacity:.55}
.pn{display:flex;justify-content:space-between;gap:8px;margin-top:18px}
a.ovd{display:block;color:var(--ink);text-decoration:none;padding:12px 16px}
.ovd .ot{font-size:19px;margin:6px 0 2px}.ovd .om{font-size:13px}
.wx.big .ic{font-size:46px}.wx.big .tp b{font-size:30px}
.rfc{margin-top:4px}
"""
head = head.replace("</style>", extra_css + "</style>")

home_all = cut(src, '<div class="pg" id="home">', '<div class="pg" id="plan">')
stay_at = home_all.index("<h2>住宿</h2>")
home = home_all[:stay_at] + '<h2>九天一覽</h2>\n<div id="ovlist"></div>\n' + home_all[stay_at:]
home = home.replace('href="#stay"', 'href="#d1-stay"')
todo = cut(src, '<div class="pg" id="todo">', "</main>")

body = ('<body>\n<header><nav aria-label="分頁選單"></nav><button id="thb" type="button" aria-label="切換配色"><i></i><span></span></button></header>\n<main>\n\n'
        + home.strip() + "\n\n"
        + '<div class="pg" id="day"><div id="dayh"></div><div class="sub-tabs" id="stabs" role="navigation" aria-label="這天的分類"></div><div class="dbody" id="dayb"></div><div class="pn" id="daypn"></div></div>\n\n'
        + todo.strip() + "\n</main>\n")

shared = cut(src, '<div id="party"', "/* ===== 倒數 ===== */")
out = head + body + shared + tail + "</script>\n</body>\n</html>\n"
(ROOT / "by-day.html").write_text(out, encoding="utf-8", newline="\n")
print("by-day.html", len(out.encode()) // 1024, "KB")
