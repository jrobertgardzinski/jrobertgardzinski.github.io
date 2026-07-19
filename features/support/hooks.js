import { BeforeAll, AfterAll, Before, After, setDefaultTimeout } from '@cucumber/cucumber';
import { chromium } from '@playwright/test';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { serveStatic } from './server.js';

setDefaultTimeout(30_000);

const dist = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'dist-test');
let browser;
let server;
let baseURL;

BeforeAll(async () => {
  if (!existsSync(join(dist, 'index.html'))) {
    throw new Error('Missing dist-test/index.html — build the fixture site first: `npm run build:fixtures` (or just `npm test`).');
  }
  const started = await serveStatic(dist);
  server = started.server;
  baseURL = `http://127.0.0.1:${started.port}`;
  browser = await chromium.launch();
});

AfterAll(async () => {
  await browser?.close();
  server?.close();
});

Before(async function () {
  this.context = await browser.newContext({ baseURL });
  // deterministic, offline scenarios: block external hosts (Google Fonts, Disqus, …)
  await this.context.route(/^https?:\/\/(?!127\.0\.0\.1)/, (route) => route.abort());
  this.page = await this.context.newPage();
});

After(async function () {
  await this.context?.close();
});
