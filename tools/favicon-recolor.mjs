// Brand raster -> SVG generator. Recolors the hand-drawn Paint-default red/green
// to the brand palette (pixel-perfect, no resampling) and emits crisp pixel SVGs
// (rect per run, sharp at any size), dark + light:
//   logo.png       -> public/favicon(.svg/-light.svg) + 64px PNG fallbacks (tiled square)
//   logo-long.png  -> public/logo-long(.svg/-light.svg)  (transparent — bare wordmark, no tile)
// Also refreshes the scratchpad favicon preview. Run: node tools/favicon-recolor.mjs
import { chromium } from '@playwright/test';
import { readFileSync, writeFileSync } from 'node:fs';

const ROOT = 'D:/git/Blog programisty Java/design_handoff_blog_static';
const SCRATCH = 'C:/Users/ROBERT~1/AppData/Local/Temp/claude/D--git-Blog-programisty-Java-design-handoff-blog-static/8b2d9db5-83bd-43d0-8ce3-4b1f92ceda85/scratchpad';
const PICS = 'C:/Users/RobertGardzinski/Pictures';

// exact source color -> brand target, per theme. '0,0,0' is the tile / background.
const DARK = { '0,0,0': [0, 0, 0], '237,28,36': [255, 192, 192], '34,177,76': [192, 255, 192], '255,255,255': [255, 255, 255] };
const LIGHT = { '0,0,0': [255, 255, 255], '237,28,36': [128, 0, 0], '34,177,76': [0, 128, 0], '255,255,255': [0, 0, 0] };

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent('<canvas id="c"></canvas>');

async function readGrid(file) {
  const src = readFileSync(file).toString('base64');
  return page.evaluate(async (dataUri) => {
    const img = new Image(); img.src = dataUri; await img.decode();
    const w = img.naturalWidth, h = img.naturalHeight;
    const c = document.getElementById('c'); c.width = w; c.height = h;
    const ctx = c.getContext('2d', { willReadFrequently: true }); ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, 0, 0);
    const s = ctx.getImageData(0, 0, w, h).data;
    const grid = [];
    for (let y = 0; y < h; y++) { const row = []; for (let x = 0; x < w; x++) { const i = (y * w + x) * 4; row.push(`${s[i]},${s[i + 1]},${s[i + 2]}`); } grid.push(row); }
    return { w, h, grid };
  }, `data:image/png;base64,${src}`);
}

async function recolorPng(file, map, scale) {
  const src = readFileSync(file).toString('base64');
  return page.evaluate(async ({ dataUri, map, scale }) => {
    const img = new Image(); img.src = dataUri; await img.decode();
    const w = img.naturalWidth, h = img.naturalHeight;
    const c = document.getElementById('c'); c.width = w; c.height = h;
    const ctx = c.getContext('2d', { willReadFrequently: true }); ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, 0, 0);
    const s = ctx.getImageData(0, 0, w, h).data; const out = ctx.createImageData(w, h);
    for (let i = 0; i < s.length; i += 4) { const k = `${s[i]},${s[i + 1]},${s[i + 2]}`; const t = map[k] || [s[i], s[i + 1], s[i + 2]]; out.data[i] = t[0]; out.data[i + 1] = t[1]; out.data[i + 2] = t[2]; out.data[i + 3] = s[i + 3]; }
    const small = document.createElement('canvas'); small.width = w; small.height = h; small.getContext('2d').putImageData(out, 0, 0);
    const oc = document.createElement('canvas'); oc.width = w * scale; oc.height = h * scale;
    const o = oc.getContext('2d'); o.imageSmoothingEnabled = false; o.drawImage(small, 0, 0, w * scale, h * scale);
    return oc.toDataURL('image/png');
  }, { dataUri: `data:image/png;base64,${src}`, map, scale });
}

const hex = ([r, g, b]) => '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');

// pixel-art SVG: optional background rect (the tile) + one rect per horizontal run
// of a foreground color. shape-rendering=crispEdges keeps the pixels sharp at any zoom.
function svg({ w, h, grid }, map, { tile }) {
  let rects = '';
  let minX = w, minY = h, maxX = -1, maxY = -1;
  for (let y = 0; y < h; y++) {
    let x = 0;
    while (x < w) {
      const key = grid[y][x];
      if (key === '0,0,0') { x++; continue; }
      let run = 1; while (x + run < w && grid[y][x + run] === key) run++;
      rects += `<rect x="${x}" y="${y}" width="${run}" height="1" fill="${hex(map[key])}"/>`;
      minX = Math.min(minX, x); maxX = Math.max(maxX, x + run - 1);
      minY = Math.min(minY, y); maxY = Math.max(maxY, y);
      x += run;
    }
  }
  // The tiled favicon keeps its full square (the tile IS the artwork). The transparent
  // wordmark is trimmed to the letters' bounding box, so it sits flush with no padding.
  const view = tile ? `0 0 ${w} ${h}` : `${minX} ${minY} ${maxX - minX + 1} ${maxY - minY + 1}`;
  const bg = tile ? `<rect width="${w}" height="${h}" fill="${hex(map['0,0,0'])}"/>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${view}" shape-rendering="crispEdges">${bg}${rects}</svg>\n`;
}

const b64 = (u) => Buffer.from(u.split(',')[1], 'base64');

// --- favicon: tiled square, svg + 64px png fallback ---
const fav = await readGrid(`${PICS}/logo.png`);
writeFileSync(`${ROOT}/public/favicon.svg`, svg(fav, DARK, { tile: true }));
writeFileSync(`${ROOT}/public/favicon-light.svg`, svg(fav, LIGHT, { tile: true }));
writeFileSync(`${ROOT}/public/favicon.png`, b64(await recolorPng(`${PICS}/logo.png`, DARK, 4)));
writeFileSync(`${ROOT}/public/favicon-light.png`, b64(await recolorPng(`${PICS}/logo.png`, LIGHT, 4)));

// --- header monogram: transparent + trimmed (takes the nav background, no tile) ---
const markDark = svg(fav, DARK, { tile: false });
writeFileSync(`${ROOT}/public/logo-mark.svg`, markDark);
writeFileSync(`${ROOT}/public/logo-mark-light.svg`, svg(fav, LIGHT, { tile: false }));
console.log('monogram trimmed viewBox:', markDark.match(/viewBox="([^"]+)"/)[1]);

// --- long wordmark: transparent + trimmed (no tile, no padding) ---
const long = await readGrid(`${PICS}/logo-long.png`);
const longDark = svg(long, DARK, { tile: false });
writeFileSync(`${ROOT}/public/logo-long.svg`, longDark);
writeFileSync(`${ROOT}/public/logo-long-light.svg`, svg(long, LIGHT, { tile: false }));
console.log('wordmark trimmed viewBox:', longDark.match(/viewBox="([^"]+)"/)[1]);

// --- favicon preview (scratchpad) ---
const d16 = await recolorPng(`${PICS}/logo.png`, DARK, 1), l16 = await recolorPng(`${PICS}/logo.png`, LIGHT, 1);
const cell = (bg, fg, label, img) => `<div style="background:${bg};padding:24px 36px;display:flex;flex-direction:column;gap:16px;align-items:center;color:${fg};font-family:sans-serif"><div style="font-size:13px;font-weight:600">${label}</div><div style="display:flex;gap:28px;align-items:center"><img src="${img}" style="width:16px;height:16px;image-rendering:pixelated"><img src="${img}" style="width:128px;height:128px;image-rendering:pixelated"></div></div>`;
await page.setContent(`<div id="shot" style="display:flex">${cell('#1e1f22', '#ddd', 'Darcula', d16)}${cell('#f4f4f4', '#333', 'Light', l16)}</div>`);
await page.locator('#shot').screenshot({ path: `${SCRATCH}/favicon-16-preview.png` });

await browser.close();
console.log('written: public/favicon(.svg/.png/-light) + public/logo-long(.svg/-light)');
