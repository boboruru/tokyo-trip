# 東京趴趴走

東京 9 天行程（1/28–2/5）手機網頁。單一 `index.html`，無相依，直接用瀏覽器開。

- 分頁：首頁／行程／天氣／美食／購物／退稅／住宿／訂票／待辦
- 三組配色（雪夜／暖冬／東京塔），右上角切換
- 天氣用 Open-Meteo 即時預報，出發前 16 天以上顯示 1 月底平均氣溫
- 待辦勾選、配色、選的日期存在瀏覽器 localStorage
- 風格仿 katelinna0704-bot.github.io/kansai；資料來自原本的「東京 9 天行程 1_28–2_5.html」

## 照片

美食、景點、購物卡片的照片來自維基共享資源（Wikimedia Commons）的免費授權照，壓成 800px JPEG 後以 base64 內嵌在 `index.html` 的 `var PH=` 裡；點開會顯示作者與授權。標「示意」的是同一道菜／同類商品，不是那家店拍的。

重新挑照片：
1. `python tools/search.py <工作資料夾>`（讀同資料夾的 `queries.json`，產生候選縮圖與 `sheet_*.jpg` 對照表、`meta.json`）
2. 看對照表，改 `choice.json`（`代號: [候選編號, 是否示意]`）
3. `python tools/build_photos.py <工作資料夾> index.html`（需要 Pillow）

代號與行程的對應在 `index.html` 的 `PMAP`（地圖關鍵字 → 照片代號）。
