// Generates all brand graphics with the real JetBrains Mono (inlined from
// node_modules, so no system-font fallback): favicons for the site and
// print-ready PNGs in brand/. Run: node tools/brand-gen.mjs
import { chromium } from '@playwright/test';
import { readFileSync, mkdirSync } from 'node:fs';

const font = readFileSync('node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-700-normal.woff2').toString('base64');
const fontFace = `@font-face{font-family:'JBM';src:url(data:font/woff2;base64,${font}) format('woff2');font-weight:700;}`;

const COLORS = {
  dark: { j: '#FFFFFF', r: '#FFC0C0', g: '#C0FFC0', tile: '#3C3F41', border: '#4E5254' },
  light: { j: '#000000', r: '#800000', g: '#008000', tile: '#FFFFFF', border: '#D4D7DC' },
};

const tile = (c) => `
<div id="shot" style="width:64px;height:64px;display:grid;place-items:center">
  <div style="width:62px;height:62px;border-radius:12px;background:${c.tile};border:2px solid ${c.border};box-sizing:border-box;display:grid;place-items:center;font-family:'JBM',monospace;font-weight:700;font-size:30px;line-height:1">
    <div><span style="font-size:24px;color:${c.j}">j</span><span style="color:${c.r}">R</span><span style="color:${c.g}">G</span></div>
  </div>
</div>`;

const wordmark = (c) => `
<div id="shot" style="display:inline-block;padding:20px;font-family:'JBM',monospace;font-weight:700;font-size:100px;line-height:1.2">
  <span style="color:${c.j}">j</span><span style="color:${c.r}">Robert</span><span style="color:${c.g}">Gardzinski</span>
</div>`;

// social preview card (Open Graph) — 1200×630, the size LinkedIn, Facebook and
// Slack crop the least. Dark theme on purpose: a link card lands in a feed of
// white boxes, so the Darcula tile stands out
const ogCard = (c) => `
<div id="shot" style="width:1200px;height:630px;background:#2B2B2B;display:grid;place-items:center;font-family:'JBM',monospace;font-weight:700">
  <div style="text-align:center">
    <div style="font-size:112px;line-height:1.2"><span style="color:${c.j}">j</span><span style="color:${c.r}">Robert</span><span style="color:${c.g}">Gardzinski</span></div>
    <div style="margin-top:28px;font-size:34px;color:#A9B7C6">// java · hexagonal architecture · ddd</div>
  </div>
</div>`;

const browser = await chromium.launch();

async function shoot(html, dsf, out) {
  const page = await browser.newPage({ viewport: { width: 1400, height: 700 }, deviceScaleFactor: dsf });
  await page.setContent(`<style>${fontFace}*{margin:0}</style>${html}`);
  await page.evaluate(() => document.fonts.ready);
  await page.locator('#shot').screenshot({ path: out, omitBackground: true });
  await page.close();
}

mkdirSync('brand', { recursive: true });

// site favicons
await shoot(tile(COLORS.dark), 1, 'public/favicon.png');
await shoot(tile(COLORS.light), 1, 'public/favicon-light.png');
await shoot(tile(COLORS.dark), 2.8125, 'public/apple-touch-icon.png'); // 180×180
await shoot(ogCard(COLORS.dark), 1, 'public/og.png'); // link preview card, see Base.astro

// print-ready brand files (transparent background)
await shoot(wordmark(COLORS.dark), 4, 'brand/wordmark-dark.png');
await shoot(wordmark(COLORS.light), 4, 'brand/wordmark-light.png');
await shoot(tile(COLORS.dark), 16, 'brand/monogram-dark.png'); // 1024×1024
await shoot(tile(COLORS.light), 16, 'brand/monogram-light.png');

await browser.close();
console.log('done');
