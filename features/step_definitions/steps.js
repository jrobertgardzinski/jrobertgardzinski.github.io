import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import assert from 'node:assert/strict';

const goto = (world, path) => world.page.goto(path, { waitUntil: 'domcontentloaded' });

// ===== navigation =====

Given('I open the home page', async function () {
  await goto(this, '/');
});

Given('I open the about page', async function () {
  await goto(this, '/o-mnie/');
});

Given('I open the home page with query {string}', async function (query) {
  await goto(this, '/' + query);
});

When('I go back', async function () {
  await this.page.goBack({ waitUntil: 'domcontentloaded' });
});

When('I click the back-to-list link', async function () {
  await this.page.locator('.back-link a').click();
});

When('I click {string} in the menu', async function (name) {
  await this.page.locator('.top-nav').getByRole('link', { name, exact: true }).click();
});

Then('the menu shows the link {string}', async function (name) {
  await expect(this.page.locator('.top-nav').getByRole('link', { name, exact: true })).toBeVisible();
});

When('I click the clear-filters button', async function () {
  await this.page.locator('#clear-filters').click();
});

Then('the clear-filters button is visible', async function () {
  await expect(this.page.locator('#clear-filters')).toBeVisible();
});

Then('the clear-filters button is hidden', async function () {
  await expect(this.page.locator('#clear-filters')).toBeHidden();
});

Then('the section chip {string} is active', async function (label) {
  await expect(this.page.locator('[data-filter="sections"]').getByRole('button', { name: label, exact: true })).toHaveClass(/active/);
});

Then('the project chip {string} is active', async function (project) {
  await expect(this.page.locator(`[data-filter="projects"] .chip[data-value="${project}"]`)).toHaveClass(/active/);
});

Then('the tag chip {string} is active', async function (tag) {
  await expect(this.page.locator(`[data-filter="tags"] .chip[data-value="${tag}"]`)).toHaveClass(/active/);
});

Then('no filter is active', async function () {
  await expect(this.page.locator('.filters .chip.active')).toHaveCount(0);
});

Given('I open the about page on a phone', async function () {
  await this.page.setViewportSize({ width: 360, height: 640 });
  await goto(this, '/o-mnie/');
});

Then('the photo is horizontally centered', async function () {
  const box = await this.page.locator('.lang-block:not([hidden]) .avatar').boundingBox();
  const viewport = this.page.viewportSize();
  const center = box.x + box.width / 2;
  assert.ok(Math.abs(center - viewport.width / 2) <= 2, `avatar center ${center}, viewport center ${viewport.width / 2}`);
});

Then('the photo top lines up with the title', async function () {
  const avatar = await this.page.locator('.lang-block:not([hidden]) .avatar').boundingBox();
  const title = await this.page.locator('.lang-block:not([hidden]) .about-title').boundingBox();
  assert.ok(Math.abs(avatar.y - title.y) <= 3, `avatar y=${avatar.y}, title y=${title.y}`);
});

// only the block for the current language is on screen — and so is its lightbox
const lightbox = (world) => world.page.locator('.lang-block:not([hidden]) [data-lightbox]');

Then('the photo is loaded', async function () {
  const loaded = await this.page
    .locator('.lang-block:not([hidden]) .avatar')
    .evaluate((img) => img.complete && img.naturalWidth > 0);
  assert.ok(loaded, 'the photo element is there, but the file never decoded');
});

When('I click the photo', async function () {
  await this.page.locator('.lang-block:not([hidden]) [data-lightbox-open]').click();
});

When('I click the close button', async function () {
  await lightbox(this).locator('[data-lightbox-close]').click();
});

When('I press Escape', async function () {
  await this.page.keyboard.press('Escape');
});

When('I click the backdrop', async function () {
  // top-left corner of the viewport — safely outside the centred dialog box
  await this.page.mouse.click(5, 5);
});

Then('the enlarged photo is visible', async function () {
  await expect(lightbox(this).locator('.lightbox-img')).toBeVisible();
});

Then('the enlarged photo is hidden', async function () {
  await expect(lightbox(this).locator('.lightbox-img')).toBeHidden();
});

Then('no enlarged photo is open', async function () {
  await expect(this.page.locator('dialog.lightbox[open]')).toHaveCount(0);
});

Then('the language switch cannot be clicked', async function () {
  await assert.rejects(
    () => this.page.locator('#lang-en').click({ timeout: 1500 }),
    'the language switch was reachable while the modal was open — the page behind it is not inert'
  );
});

Given('I open the home page on a phone', async function () {
  // a regular small smartphone, Blackberry-class — still gets the full wordmark
  await this.page.setViewportSize({ width: 360, height: 640 });
  await goto(this, '/');
});

Given('I open the home page on a narrow phone', async function () {
  // QVGA-class relic — the only case where the logo collapses to jRG
  await this.page.setViewportSize({ width: 240, height: 320 });
  await goto(this, '/');
});

Given('I open the post {string} in language {string}', async function (slug, lang) {
  await goto(this, `/wpisy/${lang}/${slug}/`);
});

When('I reload the page', async function () {
  await this.page.reload({ waitUntil: 'domcontentloaded' });
});

When('I click the post {string}', async function (title) {
  await this.page.locator('#post-list').getByRole('link', { name: title, exact: true }).click();
});

// ===== search and filters =====

When('I search for {string}', async function (query) {
  await this.page.locator('#search-input').fill(query);
});

When('I click the tag {string}', async function (tag) {
  await this.page.locator('[data-filter="tags"]').getByRole('button', { name: `#${tag}`, exact: true }).click();
});

When('I click the section {string}', async function (section) {
  await this.page.locator('[data-filter="sections"]').getByRole('button', { name: section, exact: true }).click();
});

When('I click the project {string}', async function (project) {
  await this.page.locator('[data-filter="projects"]').getByRole('button', { name: `~/${project}`, exact: true }).click();
});

// ===== mobile navigation =====

When('I tap the hamburger', async function () {
  await this.page.locator('#nav-toggle').click();
});

Then('the logo stays in place when the menu opens', async function () {
  const logo = this.page.locator('.brand');
  const before = await logo.boundingBox();
  await this.page.locator('#nav-toggle').click();
  const after = await logo.boundingBox();
  assert.deepEqual({ x: after.x, y: after.y }, { x: before.x, y: before.y });
});

Then('the hamburger stays in place when tapped', async function () {
  const toggle = this.page.locator('#nav-toggle');
  const before = await toggle.boundingBox();
  await toggle.click();
  const after = await toggle.boundingBox();
  assert.deepEqual({ x: after.x, y: after.y }, { x: before.x, y: before.y });
});

Then('the hamburger button is visible', async function () {
  await expect(this.page.locator('#nav-toggle')).toBeVisible();
});

Then('the hamburger button is hidden', async function () {
  await expect(this.page.locator('#nav-toggle')).toBeHidden();
});

Then('the menu is visible', async function () {
  await expect(this.page.locator('.nav-right')).toBeVisible();
});

Then('the menu is hidden', async function () {
  await expect(this.page.locator('.nav-right')).toBeHidden();
});

Then('the theme toggle is visible', async function () {
  await expect(this.page.locator('#theme-toggle')).toBeVisible();
});

Then('the theme toggle is hidden', async function () {
  await expect(this.page.locator('#theme-toggle')).toBeHidden();
});

Then('the theme toggle is on the right half of the screen', async function () {
  const box = await this.page.locator('#theme-toggle').boundingBox();
  const viewport = this.page.viewportSize();
  assert.ok(box.x > viewport.width / 2, `toggle at x=${box.x}, viewport ${viewport.width}`);
});

Then('the language switch is visible', async function () {
  await expect(this.page.locator('.lang-switch')).toBeVisible();
});

Then('the logo is hidden', async function () {
  await expect(this.page.locator('.brand')).toBeHidden();
});

Then('the logo is visible', async function () {
  await expect(this.page.locator('.brand')).toBeVisible();
});

Then('the logo shows {string}', async function (text) {
  await expect(this.page.locator('.logo-badge')).toHaveText(text, { useInnerText: true });
});

Then('the logo is shown as the monogram image', async function () {
  await expect(this.page.locator('.logo-mark')).toBeVisible();
  // exactly one theme variant of the mark is rendered
  await expect(this.page.locator('.logo-mark img:visible')).toHaveCount(1);
});

Then('the wordmark logo is shown', async function () {
  await expect(this.page.locator('.logo-wordmark')).toBeVisible();
  await expect(this.page.locator('.logo-wordmark img:visible')).toHaveCount(1);
});

Then('the wordmark logo is hidden', async function () {
  await expect(this.page.locator('.logo-wordmark')).toBeHidden();
});

Then('the wordmark logo is the {string} variant', async function (variant) {
  const file = variant === 'light' ? 'logo-long-light\\.svg' : 'logo-long\\.svg';
  await expect(this.page.locator('.logo-wordmark img:visible')).toHaveAttribute('src', new RegExp(file));
});

Then('the brand link is labelled {string}', async function (label) {
  await expect(this.page.locator('.brand')).toHaveAttribute('aria-label', label);
});

Then('the monogram image is the {string} variant', async function (variant) {
  const file = variant === 'light' ? 'logo-mark-light\\.svg' : 'logo-mark\\.svg';
  await expect(this.page.locator('.logo-mark img:visible')).toHaveAttribute('src', new RegExp(file));
});

// ===== theme and language =====

When('I toggle the theme', async function () {
  await this.page.locator('#theme-toggle').click();
});

When('I switch the language to {string}', async function (lang) {
  await this.page.locator(`#lang-${lang.toLowerCase()}`).click();
});

Then('the page theme is {string}', async function (theme) {
  await expect(this.page.locator('html')).toHaveAttribute('data-theme', theme);
});

Then('the theme button label is {string}', async function (label) {
  await expect(this.page.locator('#theme-toggle')).toHaveText(label);
});

Then('the canonical URL is {string}', async function (url) {
  await expect(this.page.locator('link[rel="canonical"]')).toHaveAttribute('href', url);
});

Then('the favicon is {string}', async function (href) {
  await expect(this.page.locator('link[rel="icon"][type="image/svg+xml"]')).toHaveAttribute('href', href);
});

Then('the PNG favicon is {string}', async function (href) {
  await expect(this.page.locator('link[rel="icon"][type="image/png"]')).toHaveAttribute('href', href);
});

Then('the active language is {string}', async function (lang) {
  await expect(this.page.locator(`#lang-${lang.toLowerCase()}`)).toHaveClass(/active/);
});

// ===== post list assertions =====

Then('I see {int} post/posts in the list', async function (count) {
  await expect(this.page.locator('.post-row:visible')).toHaveCount(count);
});

Then('I see only posts in {string}', async function (lang) {
  const allowed = lang === 'EN' ? ['EN', 'PL/EN'] : ['PL', 'PL/EN'];
  const badges = this.page.locator('.post-row:visible .variant:visible .lang-badge');
  await expect(badges.first()).toBeVisible();
  for (const text of await badges.allTextContents()) {
    assert.ok(allowed.includes(text.trim()), `Unexpected language badge on the list: "${text.trim()}"`);
  }
});

Then('I see the tag chip {string}', async function (tag) {
  await expect(this.page.locator(`[data-filter="tags"] .chip[data-value="${tag}"]`)).toBeVisible();
});

Then('I do not see the tag chip {string}', async function (tag) {
  await expect(this.page.locator(`[data-filter="tags"] .chip[data-value="${tag}"]`)).toBeHidden();
});

Then('I see the project chip {string}', async function (project) {
  await expect(this.page.locator(`[data-filter="projects"] .chip[data-value="${project}"]`)).toBeVisible();
});

Then('I do not see the project chip {string}', async function (project) {
  await expect(this.page.locator(`[data-filter="projects"] .chip[data-value="${project}"]`)).toBeHidden();
});

Then('the {word} row shows a dash', async function (row) {
  await expect(this.page.locator(`[data-filter="${row}"] .chip-none`)).toBeVisible();
});

Then('the search placeholder is {string}', async function (text) {
  await expect(this.page.locator('#search-input')).toHaveAttribute('placeholder', text);
});

Then('the result counter shows {string}', async function (text) {
  await expect(this.page.locator('#result-count')).toHaveText(text);
});

Then('the featured post is {string}', async function (title) {
  await expect(this.page.locator('.featured-card:visible .featured-title')).toHaveText(title);
});

Then('the featured post label is {string}', async function (label) {
  await expect(this.page.locator('.featured-card:visible .featured-label')).toHaveText(label);
});

// ===== pagination =====

When('I go to page {int}', async function (page) {
  await this.page.locator('#pager').getByRole('button', { name: String(page), exact: true }).click();
});

Then('the home footer has no top border', async function () {
  await expect(this.page.locator('.site-footer')).toHaveCSS('border-top-style', 'none');
});

Then('the footer has a top border', async function () {
  await expect(this.page.locator('.site-footer')).toHaveCSS('border-top-style', 'solid');
});

Then('the pagination has a bottom border', async function () {
  await expect(this.page.locator('#pager')).toHaveCSS('border-bottom-style', 'solid');
});

Then('the pagination is hidden', async function () {
  await expect(this.page.locator('#pager')).toBeHidden();
});

Then('the pagination is visible', async function () {
  await expect(this.page.locator('#pager')).toBeVisible();
});

Then('page {int} is active', async function (page) {
  await expect(this.page.locator('#pager').getByRole('button', { name: String(page), exact: true })).toHaveClass(/active/);
});

// ===== generic and post page assertions =====

Then('I see the text {string}', async function (text) {
  await expect(this.page.getByText(text).first()).toBeVisible();
});

Then('the notice {string} is hidden', async function (text) {
  await expect(this.page.locator('.translation-notice', { hasText: text })).toBeHidden();
});

Then('I see the card {string}', async function (title) {
  await expect(this.page.locator('.about-card .card-title:visible').getByText(title, { exact: true })).toBeVisible();
});

Then('I am on the post {string}', async function (title) {
  await expect(this.page.locator('h1.post-title')).toHaveText(title);
});

Then('the page address contains {string}', async function (fragment) {
  await expect(this.page).toHaveURL(new RegExp(fragment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
});

Then('the post content contains {string}', async function (text) {
  await expect(this.page.locator('.post-body')).toContainText(text);
});

Then('the post meta shows {string}', async function (text) {
  await expect(this.page.locator('.post-meta')).toContainText(text);
});

Then('the post meta does not show {string}', async function (text) {
  await expect(this.page.locator('.post-meta')).not.toContainText(text);
});

Then('there is no history link', async function () {
  await expect(this.page.locator('.post-history')).toHaveCount(0);
});

Then('the history link points to {string}', async function (url) {
  await expect(this.page.locator('.post-history a')).toHaveAttribute('href', url);
});

Then('the post language badge is {string}', async function (badge) {
  await expect(this.page.locator('.post-meta .lang-badge')).toHaveText(badge);
});

Then('I see the code block header {string}', async function (filename) {
  await expect(this.page.locator('.code-title').getByText(filename, { exact: true })).toBeVisible();
});

Then('I see the section heading {string}', async function (heading) {
  await expect(this.page.locator('.section-heading').getByText(heading)).toBeVisible();
});

Then('the footer link {string} points to {string}', async function (name, href) {
  await expect(this.page.locator('.site-footer').getByRole('link', { name, exact: true })).toHaveAttribute('href', href);
});

// ===== analytics =====

Then('the page has no GoatCounter script', async function () {
  await expect(this.page.locator('script[data-goatcounter]')).toHaveCount(0);
});

Then('the page has a GoatCounter script for {string}', async function (code) {
  await expect(this.page.locator('script[data-goatcounter]')).toHaveAttribute(
    'data-goatcounter',
    `https://${code}.goatcounter.com/count`
  );
});

Then('the post has no view counter', async function () {
  await expect(this.page.locator('.post-views')).toHaveCount(0);
});

// stubs the public counts endpoint — the hook aborts external requests, and a route
// registered later wins, so this must run BEFORE the post page is opened
Given('GoatCounter reports {string} views', async function (count) {
  await this.context.route(/goatcounter\.com\/counter\//, (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ count }) })
  );
});

Given('GoatCounter has no data for this page', async function () {
  await this.context.route(/goatcounter\.com\/counter\//, (route) => route.fulfill({ status: 404, body: '' }));
});

Then('the post view counter shows {string}', async function (text) {
  await expect(this.page.locator('.post-views')).toHaveText(text);
});

// ===== HTTP requests (RSS, 404s, …) =====

When('I fetch {string}', async function (path) {
  this.response = await this.context.request.get(path);
  this.responseText = await this.response.text();
});

Then('the response status is {int}', function (status) {
  assert.equal(this.response.status(), status);
});

Then('the response contains {string}', function (text) {
  assert.ok(this.responseText.includes(text), `Response does not contain: ${text}`);
});

Then('the response does not contain {string}', function (text) {
  assert.ok(!this.responseText.includes(text), `Response unexpectedly contains: ${text}`);
});
