/* ===== 倒數 ===== */
(function(){var n=new Date(),d=new Date(n.getFullYear(),n.getMonth(),n.getDate()),c=$("#count"),k=Math.round((TRIP0-d)/864e5),ti=todayIdx();
if(k>0)c.innerHTML='還有<strong>'+k+'</strong>天出發';else if(ti>=0)c.innerHTML='東京第<strong>'+(ti+1)+'</strong>天｜'+esc(D[ti].t);else c.innerHTML='旅程結束，下次見';})();
function restart(el){el.style.animation="none";void el.offsetWidth;el.style.animation=""}

/* ===== 每天的住宿提醒 ===== */
var DN=["今天入住｜利木津巴士直達飯店，入住時間看訂房確認信｜大都會口 7:00~23:00 開放，其他時間走西口",
"早上 7:00 出發，晚上約 21:15 回到飯店｜今天走很多山路，鞋子穿好走的",
"河口湖巴士從 Sunshine City Prince Hotel 上車，從飯店走約 20 分，發車前 30 分要到｜晚餐在池袋東武 15F，吃完走回飯店",
"晚上 17:15 從原宿回池袋，可以先回飯店放戰利品，退稅收據收好",
"晚上約 19:30 從江之島出發回池袋",
"晚上 17:00 從神谷町回池袋｜高湯包是消耗品，要退稅的話先別拆封",
"晚上 20:00 從銀座回池袋（丸之內線直達約 20 分）",
"今晚請飯店櫃台預約明早 8:30 計程車｜整理行李：退稅商品和收據放手提行李",
"退房日，8:30 搭計程車出發｜退房前檢查保險箱、充電器、護照"];

/* ===== 分頁 ===== */
var TABS=[["plan","行程"],["weather","天氣"],["food","美食"],["shop","購物"],["refund","退稅"],["stay","住宿"],["book","訂票"]];
function foodOf(i){return F.filter(function(f){return f[0]===i+1})}
function shopOf(i){return S.filter(function(s){return s[0]===i+1})}
function bookOf(i){return B.filter(function(b){return b[0].indexOf("Day "+(i+1)+"｜")===0})}
function has(t,i){if(t==="food")return foodOf(i).length>0;if(t==="shop")return shopOf(i).length>0;if(t==="refund")return shopOf(i).length>0||i===8;if(t==="book")return bookOf(i).length>0;return true}
var sel=0,tab=store("tab")||"plan";if(!TABS.some(function(t){return t[0]===tab}))tab="plan";
var mealsHtml=function(d){return '<div class="meals"><div><b>早餐</b>'+esc(d.m[0])+'</div><div><b>午餐</b>'+esc(d.m[1])+'</div><div><b>晚餐</b>'+esc(d.m[2])+'</div></div>'};

/* 導覽列：總覽／Day1~9／待辦 */
$("nav").innerHTML='<a href="#home">總覽</a>'+D.map(function(d,i){return '<a href="#d'+(i+1)+'" class="dn">Day '+(i+1)+'<small>'+d.d+'（'+d.w+'）</small></a>'}).join("")+'<a href="#todo">待辦</a>';

/* 總覽的九天一覽 */
$("#ovlist").innerHTML=D.map(function(d,i){var mu=d.i.filter(function(x){return x[5]}).map(function(x){return x[1]});
return '<a class="card ovd" href="#d'+(i+1)+'-plan"><span class="pill '+["tc","ts","ty","tg"][i%4]+'">Day '+(i+1)+'｜'+dlabel(i)+'</span><div class="ot">'+esc(d.t)+'</div>'+(mu.length?'<div class="om">必去：'+esc(mu.join("、"))+'</div>':'')+'<div class="om">吃：'+esc(d.m[1])+'、'+esc(d.m[2])+'</div></a>'}).join("");

/* --- 各分頁內容 --- */
function tPlan(i){var d=D[i],stops=[H];d.i.forEach(function(x){if(x[3]&&stops.indexOf(x[3])<0)stops.push(x[3])});
var route="https://www.google.com/maps/dir/"+stops.map(encodeURIComponent).join("/")+"/";
var h=mealsHtml(d)+'<div class="acts"><a class="pill ts" target="_blank" rel="noopener" href="'+route+'">開啟當日路線</a><button id="locb" class="pill tc" type="button">定位：我現在在哪裡？</button></div><div id="locr"></div><ul class="tl">';
d.i.forEach(function(x){h+='<li'+(x[5]?' class="must"':'')+'>'+(x[5]?'<span class="must-b">必去</span>':'')+(x[4]?'<span class="ar">'+esc(x[4])+'</span>':'')+'<span class="tm">'+esc(x[0])+'</span>'+esc(x[1])+(x[2]?'<p>'+esc(x[2]).split("｜").join("\n")+'</p>':'')+(x[3]?th(x[3],x[1]):'')+(x[3]?'<div class="lk"><a class="pill" target="_blank" rel="noopener" href="'+M(x[3])+'">地圖</a></div>':'')+'</li>'});
return h+'</ul><p class="note">營業時間與票價為查詢時的資料，出發前請再確認。標「待確認」的是尚未查到的資訊。</p>'}

function wxCard(i){var loc=WD[i],x=WX[loc],k=x&&x.time?x.time.indexOf(iso(i)):-1,ic,tx,hi,lo,tag;
if(k>=0){var w=WMO(x.weather_code[k]);ic=w[0];tx=w[1]+(x.precipitation_probability_max&&x.precipitation_probability_max[k]!=null?"｜降雨 "+x.precipitation_probability_max[k]+"%":"");hi=Math.round(x.temperature_2m_max[k]);lo=Math.round(x.temperature_2m_min[k]);tag='<span class="pill tg" style="font-size:11px;padding:0 6px">預報</span>'}
else{ic=WAVG[loc][1]<0?"🧣":"🧥";tx="1 月底平均氣溫";hi=WAVG[loc][0];lo=WAVG[loc][1];tag='<span class="pill" style="font-size:11px;padding:0 6px">平均</span>'}
return {f:k>=0,h:'<div class="card wx big"><div class="ic">'+ic+'</div><div><div class="nm">'+esc(loc)+' '+tag+'</div><small>'+esc(tx)+'</small></div><div class="tp"><b>'+hi+'°</b> / '+lo+'°</div></div>',lo:lo}}
function tWeather(i){var c=wxCard(i),loc=WD[i],h=c.h;
h+='<p style="font-size:14px;margin:4px 2px 14px">'+(c.f?'這是 Open-Meteo 的最新預報。':(wxLoaded?'離這天超過 16 天，還抓不到預報，先顯示 1 月底的平均氣溫；出發前兩週左右會自動換成預報。':'正在抓最新預報…'))+'</p>';
var tips=[];if(c.lo<0)tips.push('<b>今天會到零下</b>：毛帽、手套、圍巾、暖暖包一定要帶。');
if(loc==="高尾山")tips.push('<b>山上比市區冷 3~5 度</b>，山路可能結冰，穿止滑的鞋。');
if(loc==="河口湖")tips.push('<b>湖邊風很大</b>：防風外套最重要，拍富士山時手會凍，帶觸控手套。');
if(loc==="鎌倉")tips.push('<b>海邊看日落風大</b>，傍晚會突然變冷，多帶一件。');
tips.push('<b>洋蔥式</b>：發熱衣＋毛衣＋防風羽絨外套。室內和電車暖氣很強，要好穿脫。');
tips.push('<b>很乾燥</b>：護唇膏、乳液。');
h+='<div class="card"><h3 style="font-size:18px;margin-bottom:6px">今天怎麼穿</h3>'+tips.map(function(t){return '<p style="margin:2px 0;font-size:14px">・'+t+'</p>'}).join("")+'</div>';
var tk=WX["東京"];if(tk&&tk.time){var w=WMO(tk.weather_code[0]);h+='<p class="note">參考：東京今天（'+tk.time[0]+'）'+w[1]+' '+Math.round(tk.temperature_2m_max[0])+'° / '+Math.round(tk.temperature_2m_min[0])+'°</p>'}
return h}

function tFood(i){var list=foodOf(i),h=mealsHtml(D[i]);
if(!list.length)return h+'<div class="card empty">這天沒有特別排餐廳，<br>走到哪吃到哪就好。</div>';
h+='<div class="card mall"><h3>這天吃這些</h3><div class="zone">';list.forEach(function(f){h+='<div class="fr"><div class="fb">'+esc(f[1])+'</div><div><div class="nm">'+esc(f[2])+'</div><div class="ds">'+esc(f[3]).split("｜").join("\n")+'</div>'+th(f[4],f[2])+'<div class="acts"><a class="pill" target="_blank" rel="noopener" href="'+M(f[4])+'">地圖</a><a class="pill" target="_blank" rel="noopener" href="https://www.google.com/search?tbm=isch&q='+encodeURIComponent(f[4]+" food")+'">更多照片</a></div></div></div>'});
return h+'</div></div><p class="note">餐點整理自評論，以現場菜單為準。照片來自維基共享資源，標「示意」的不是那家店拍的。</p>'}

function tShop(i){var list=shopOf(i);if(!list.length)return '<div class="card empty">這天沒有排購物，<br>輕鬆走走就好。</div>';
var h='<div class="card mall"><h3>這天可以逛</h3><div class="zone">';list.forEach(function(s,k){h+='<div class="fr"><div class="fb">'+(k+1)+'</div><div><div class="nm">'+esc(s[1])+'</div><div class="ds">'+esc(s[2]).split("｜").join("\n")+'</div>'+th(s[3],s[1])+'<div class="acts"><a class="pill" target="_blank" rel="noopener" href="'+M(s[3])+'">地圖</a></div></div></div>'});
return h+'</div></div><p class="note">要退稅的店記得帶護照，規則看這天的「退稅」。</p>'}

var rsel=null;
function tRefund(i){var list=shopOf(i),h='';
if(i===8)h+='<div class="card" style="background:var(--mustbg)"><h3 style="font-size:19px;margin-bottom:6px">今天要在機場辦退稅</h3><p style="font-size:15px;margin:2px 0">10:00 到成田 T2，<b>先不要託運行李</b>，先去海關自助機刷護照。下面「機場刷護照」有完整步驟。</p></div>';
else if(list.length)h+='<div class="card"><h3 style="font-size:19px;margin-bottom:6px">今天可能會辦退稅的店</h3>'+list.map(function(s){return '<p style="font-size:15px;margin:2px 0">・'+esc(s[1])+'</p>'}).join("")+'<p style="font-size:14px;margin:6px 0 0">結帳前說「免税をお願いします」並給護照；收據留到 2/5 出境。</p></div>';
else h+='<div class="card empty">這天沒有排購物，不太會用到退稅。<br>下面是完整的退稅說明，想先看也可以。</div>';
var r=rsel!==null?rsel:(i===8?4:list.length?1:0);
h+='<div class="chips rfc" role="group" aria-label="退稅主題">'+R.map(function(x,k){return '<button type="button" class="pill chip" data-r="'+k+'" aria-pressed="'+(k===r)+'">'+x[0]+'</button>'}).join("")+'</div><div class="rf" id="rfb">'+R[r][1]+'</div>';
return h}

function tStay(i){return '<div class="card" style="background:var(--mustbg)"><h3 style="font-size:18px;margin-bottom:6px">今天的住宿提醒</h3>'+DN[i].split("｜").map(function(t){return '<p style="margin:2px 0;font-size:15px">・'+esc(t)+'</p>'}).join("")+'</div>'+
'<div class="card hotel"><h3>池袋大都會飯店</h3><p>Hotel Metropolitan Tokyo Ikebukuro</p><p>入住：1/28（四）至 2/5（五），共 8 晚，全程同一間'+(i<8?'，今天是第 '+(i+1)+' 晚':'，今天退房')+'</p><p>電話：<a href="tel:+81339801111">+81-3-3980-1111</a></p><p>地址：1-6-1 Nishi-Ikebukuro, Toshima-ku, Tokyo 171-8505（豐島區西池袋 1-6-1）</p><p>交通：JR 池袋站「大都會口」出來就到</p><div class="acts" style="margin:8px 0 0"><a class="pill ts" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=Hotel+Metropolitan+Tokyo+Ikebukuro">在 Google 地圖開啟</a><a class="pill tg" target="_blank" rel="noopener" href="https://www.google.com/maps/dir/?api=1&destination=Hotel+Metropolitan+Tokyo+Ikebukuro&travelmode=transit">導航回飯店</a></div></div><p class="note">電話、地址是查詢時的資料，請以訂房確認信為準。</p>'}

function tBook(i){var list=bookOf(i);if(!list.length)return '<div class="card empty">這天沒有要先買的票。<br>要訂位的餐廳列在「待辦」。</div><div class="acts" style="justify-content:center"><a class="pill ty" href="#todo">看待辦</a></div>';
return list.map(function(b,k){var p=b[0].split("｜");return '<div class="card"><span class="pill '+["ts","ty","tg","tc"][k%4]+'">'+esc(p[0])+'</span><div style="font-size:17px;margin:6px 0 2px">'+esc(p[1]||"")+'</div><div style="font-size:14px;white-space:pre-line">'+esc(b[1]).split("｜").join("\n")+'</div><div class="acts" style="margin:8px 0 0"><a class="pill" target="_blank" rel="noopener" href="'+b[2]+'">'+esc(b[3])+'</a></div></div>'}).join("")+'<p class="note">價格與班次出發前請在官網確認。</p>'}

var RENDER={plan:tPlan,weather:tWeather,food:tFood,shop:tShop,refund:tRefund,stay:tStay,book:tBook};
function renderDay(){var d=D[sel];
$("#dayh").innerHTML='<span class="pill tc">Day '+(sel+1)+'</span> '+dlabel(sel)+'<small>'+esc(d.t)+'</small>';
$("#stabs").innerHTML=TABS.map(function(t){return '<a class="stab'+(has(t[0],sel)?'':' mute')+'" href="#d'+(sel+1)+'-'+t[0]+'"'+(t[0]===tab?' aria-current="page"':'')+'>'+t[1]+'</a>'}).join("");
var b=$("#dayb");b.innerHTML=RENDER[tab](sel);restart(b);
var cur=$("#stabs [aria-current]");if(cur)cur.scrollIntoView({inline:"center",block:"nearest"});
$("#daypn").innerHTML=(sel>0?'<a class="pill" href="#d'+sel+'-'+tab+'">← Day '+sel+'</a>':'<span></span>')+(sel<D.length-1?'<a class="pill" href="#d'+(sel+2)+'-'+tab+'">Day '+(sel+2)+' →</a>':'<span></span>');
if(tab==="weather")loadWeather()}

/* 退稅主題切換、定位（內容是動態產生的，用事件委派） */
$("#dayb").addEventListener("click",function(e){var c=e.target.closest(".chip");if(c){rsel=+c.getAttribute("data-r");Array.prototype.forEach.call(document.querySelectorAll("#dayb .chip"),function(x){x.setAttribute("aria-pressed",x===c)});var r=$("#rfb");r.innerHTML=R[rsel][1];restart(r);return}
if(e.target.closest("#locb"))locate()});

/* ===== 定位 ===== */
function toMin(s){var m=/(\d{1,2}):(\d{2})/.exec(s);return m?(+m[1])*60+(+m[2]):-1}
function locate(){var r=$("#locr");if(!navigator.geolocation){r.textContent="這個瀏覽器不支援定位。";return}
r.textContent="定位中…";navigator.geolocation.getCurrentPosition(function(p){var la=p.coords.latitude.toFixed(5),lo=p.coords.longitude.toFixed(5),ti=todayIdx(),di=ti>=0?ti:sel,n=new Date(),now=n.getHours()*60+n.getMinutes(),nx=null;
D[di].i.forEach(function(x){if(nx||!x[3])return;if(ti<0||toMin(x[0])>=now)nx=x});if(!nx&&ti<0)nx=D[di].i.filter(function(x){return x[3]})[0];
var h='你在：'+la+', '+lo+'（誤差約 '+Math.round(p.coords.accuracy)+' 公尺）<div class="acts"><a class="pill tg" target="_blank" rel="noopener" href="'+M(la+","+lo)+'">在地圖看我在哪</a>';
if(nx)h+='<a class="pill ty" target="_blank" rel="noopener" href="https://www.google.com/maps/dir/?api=1&origin='+la+","+lo+'&destination='+encodeURIComponent(nx[3])+'&travelmode=transit">導航到下一站：'+esc(nx[1])+'</a>';
h+='<a class="pill ts" target="_blank" rel="noopener" href="https://www.google.com/maps/dir/?api=1&origin='+la+","+lo+'&destination='+encodeURIComponent(H)+'&travelmode=transit">回飯店</a></div>';r=$("#locr");if(r)r.innerHTML=h},
function(e){var r=$("#locr");if(r)r.textContent=e.code===1?"沒有定位權限：請到瀏覽器設定允許這個網頁使用位置。":"定位失敗，換到空曠處再試一次。"},{enableHighAccuracy:true,timeout:15000,maximumAge:60000})}

/* ===== 天氣 ===== */
var WMO=function(c){if(c===0)return["☀️","晴"];if(c<=2)return["🌤️","晴時多雲"];if(c===3)return["☁️","陰"];if(c<=48)return["🌫️","霧"];if(c<=57)return["🌦️","毛毛雨"];if(c<=67)return["🌧️","雨"];if(c<=77)return["🌨️","雪"];if(c<=82)return["🌦️","陣雨"];if(c<=86)return["🌨️","陣雪"];return["⛈️","雷雨"]};
var WX={},wxLoaded=0,wxBusy=0;
function iso(i){var d=new Date(TRIP0.getFullYear(),TRIP0.getMonth(),TRIP0.getDate()+i);return d.getFullYear()+"-"+("0"+(d.getMonth()+1)).slice(-2)+"-"+("0"+d.getDate()).slice(-2)}
function loadWeather(){if(wxLoaded||wxBusy)return;wxBusy=1;var locs=Object.keys(WL),left=locs.length;
locs.forEach(function(l){fetch("https://api.open-meteo.com/v1/forecast?latitude="+WL[l][0]+"&longitude="+WL[l][1]+"&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Asia%2FTokyo&forecast_days=16").then(function(r){return r.json()}).then(function(j){if(j&&j.daily)WX[l]=j.daily}).catch(function(){}).then(function(){if(--left===0){wxLoaded=1;if(tab==="weather"&&$("#day").classList.contains("on"))renderDay()}})})}

/* ===== 待辦 ===== */
$("#todol").innerHTML=T.map(function(t,k){return '<li><label><input type="checkbox" data-k="'+k+'"'+(store("todo"+k)==="1"?" checked":"")+'><span class="bx"></span><span class="tx">'+esc(t)+'</span></label></li>'}).join("");
function prog(){var n=document.querySelectorAll("#todol input:checked").length;$("#prog").innerHTML='已完成 '+n+' / '+T.length+'<div class="bar"><i style="width:'+(n/T.length*100)+'%"></i></div>';return n}
prog();
$("#todol").addEventListener("change",function(e){var k=e.target.getAttribute("data-k");if(k===null)return;store("todo"+k,e.target.checked?"1":"0");if(prog()===T.length&&e.target.checked)party()});

/* ===== 路由：#home、#todo、#d3、#d3-food ===== */
var first=1;
function route(){var h=location.hash.slice(1),m=/^d([1-9])(?:-([a-z]+))?$/.exec(h),pg="home",navHref="#home";
if(h==="todo"){pg="todo";navHref="#todo"}
else if(m){pg="day";sel=+m[1]-1;if(m[2]&&RENDER[m[2]])tab=m[2];store("tab",tab);store("day",sel);rsel=null;navHref="#d"+(sel+1);renderDay()}
else if(!h&&todayIdx()>=0){location.replace("#d"+(todayIdx()+1)+"-plan");return}
["home","day","todo"].forEach(function(p){$("#"+p).classList.toggle("on",p===pg)});
Array.prototype.forEach.call(document.querySelectorAll("nav a"),function(a){if(a.getAttribute("href")===navHref){a.setAttribute("aria-current","page");a.scrollIntoView({inline:"center",block:"nearest"})}else a.removeAttribute("aria-current")});
if(!first)window.scrollTo(0,0);
if(pg!=="home"&&!first&&Math.random()<.4)setTimeout(stroll,700);first=0}
window.addEventListener("hashchange",route);
route();
