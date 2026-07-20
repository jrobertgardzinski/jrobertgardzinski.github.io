// Screenshots the header in three states so the wordmark<->monogram swap is
// visible at a glance. Serves the test build (dist-test). Run after `npm test`.
import { serveStatic } from '../features/support/server.js';
import { chromium } from '@playwright/test';

const SCRATCH = 'C:/Users/ROBERT~1/AppData/Local/Temp/claude/D--git-Blog-programisty-Java-design-handoff-blog-static/8b2d9db5-83bd-43d0-8ce3-4b1f92ceda85/scratchpad';
const { server, port } = await serveStatic('dist-test');
const base = `http://127.0.0.1:${port}`;
const browser = await chromium.launch();

async function navShot(width, theme) {
  const page = await browser.newPage({ viewport: { width, height: 160 } });
  await page.addInitScript((t) => localStorage.setItem('theme', t), theme);
  await page.goto(`${base}/`, { waitUntil: 'networkidle' });
  const b64 = (await page.locator('.top-nav').screenshot()).toString('base64');
  await page.close();
  return b64;
}

const desktopDark = await navShot(1000, 'dark');
const desktopLight = await navShot(1000, 'light');
const mobileDark = await navShot(360, 'dark');
const mobileLight = await navShot(360, 'light');

const row = (label, b64, bg) => `<div style="margin-bottom:20px"><div style="font:600 12px sans-serif;color:#999;margin-bottom:6px">${label}</div><img src="data:image/png;base64,${b64}" style="display:block;border:1px solid #333;background:${bg}"></div>`;
const page = await browser.newPage({ viewport: { width: 1120, height: 900 } });
await page.setContent(`<div id="shot" style="padding:26px;background:#141414;display:inline-block">
  ${row('Desktop (≥641px), Darcula — wordmark', desktopDark, '#1e1f22')}
  ${row('Desktop (≥641px), Light — wordmark', desktopLight, '#ffffff')}
  ${row('Mobile (≤640px), Darcula — monogram', mobileDark, '#1e1f22')}
  ${row('Mobile (≤640px), Light — monogram', mobileLight, '#ffffff')}
</div>`);
await page.locator('#shot').screenshot({ path: `${SCRATCH}/logo-swap-preview.png` });

await browser.close();
server.close();
console.log('preview written');
