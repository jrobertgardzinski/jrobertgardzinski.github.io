// Home page island: language visibility, search, section/project/tag filters,
// pagination — with the filter state encoded in the URL
// (?section=&project=&tags=&q=&page=), so back-navigation restores it,
// a clean "/" gives a clean slate and filtered views are shareable links.
// All filters combine with AND; any change resets pagination to page 1.
import { getLang } from './site.js';
import { postCountLabel } from '../lib/i18n.js';

const list = document.getElementById('post-list');
const rows = [...document.querySelectorAll('.post-row')];
const searchInput = document.getElementById('search-input');
const resultCount = document.getElementById('result-count');
const emptyState = document.getElementById('empty-state');
const pager = document.getElementById('pager');
const clearButton = document.getElementById('clear-filters');
const PER_PAGE = Number(list?.dataset.perPage) || 12;

const state = { query: '', tags: new Set(), section: null, project: null, page: 0 };

const chips = (row) => [...document.querySelectorAll(`[data-filter="${row}"] .chip`)];
const chipValues = (row) => new Set(chips(row).map((c) => c.dataset.value));

function rowMatches(row, lang) {
  if (!row.dataset.langs.split(',').includes(lang)) return false;
  const q = state.query.trim().toLowerCase();
  if (q) {
    const text = row.dataset[lang === 'pl' ? 'searchPl' : 'searchEn'] || '';
    if (!text.includes(q)) return false;
  }
  const tags = row.dataset.tags ? row.dataset.tags.split(',') : [];
  for (const t of state.tags) if (!tags.includes(t)) return false;
  if (state.section && row.dataset.section !== state.section) return false;
  if (state.project && row.dataset.project !== state.project) return false;
  return true;
}

function renderPager(pageCount) {
  pager.hidden = pageCount <= 1;
  pager.innerHTML = '';
  if (pager.hidden) return;
  const btn = (label, onClick, active = false) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'pager-btn' + (active ? ' active' : '');
    b.textContent = label;
    b.addEventListener('click', onClick);
    pager.appendChild(b);
  };
  btn('←', () => { state.page = Math.max(0, state.page - 1); apply(); });
  for (let i = 0; i < pageCount; i++) btn(String(i + 1), () => { state.page = i; apply(); }, i === state.page);
  btn('→', () => { state.page = Math.min(pageCount - 1, state.page + 1); apply(); });
}

// projects and tags belong to sections: with a section selected, only its chips
// stay visible and active selections from outside of it are dropped;
// a row with nothing left shows a dash
function updateChipScope() {
  for (const row of document.querySelectorAll('[data-filter="projects"], [data-filter="tags"]')) {
    let anyVisible = false;
    for (const chip of row.querySelectorAll('.chip')) {
      const sections = (chip.dataset.sections || '').split(',');
      const show = !state.section || sections.includes(state.section);
      chip.hidden = !show;
      anyVisible = anyVisible || show;
      if (!show && chip.classList.contains('active')) {
        chip.classList.remove('active');
        if (row.dataset.filter === 'tags') state.tags.delete(chip.dataset.value);
        else if (state.project === chip.dataset.value) state.project = null;
      }
    }
    const none = row.querySelector('.chip-none');
    if (none) none.hidden = anyVisible;
  }
}

function updateUrl() {
  const params = new URLSearchParams();
  if (state.query.trim()) params.set('q', state.query.trim());
  if (state.section) params.set('section', state.section);
  if (state.project) params.set('project', state.project);
  if (state.tags.size) params.set('tags', [...state.tags].join(','));
  if (state.page > 0) params.set('page', String(state.page + 1));
  const qs = params.toString();
  history.replaceState(null, '', qs ? `?${qs}` : location.pathname);
}

function apply() {
  const lang = getLang();
  const matched = rows.filter((r) => rowMatches(r, lang));
  const pageCount = Math.max(1, Math.ceil(matched.length / PER_PAGE));
  state.page = Math.min(state.page, pageCount - 1);
  const pageRows = matched.slice(state.page * PER_PAGE, (state.page + 1) * PER_PAGE);
  for (const row of rows) {
    row.hidden = !pageRows.includes(row);
    for (const v of row.querySelectorAll('.variant')) v.hidden = v.dataset.lang !== lang && row.dataset.langs.includes(lang);
  }
  resultCount.textContent = postCountLabel(matched.length, lang);
  emptyState.hidden = matched.length > 0;
  renderPager(pageCount);
  for (const card of document.querySelectorAll('.featured-card[data-lang]')) card.hidden = card.dataset.lang !== lang;
  for (const chip of document.querySelectorAll('[data-filter="sections"] .chip')) {
    chip.textContent = chip.dataset[lang === 'pl' ? 'labelPl' : 'labelEn'];
  }
  // list chrome (labels, placeholder, empty state, clear button) is bilingual
  if (searchInput) searchInput.placeholder = searchInput.dataset[lang === 'pl' ? 'placeholderPl' : 'placeholderEn'];
  for (const el of document.querySelectorAll('[data-i18n-pl]')) {
    el.textContent = el.dataset[lang === 'pl' ? 'i18nPl' : 'i18nEn'];
  }
  if (clearButton) {
    const hasFilters = Boolean(state.query.trim()) || state.tags.size > 0 || Boolean(state.section) || Boolean(state.project);
    clearButton.hidden = !hasFilters;
  }
  updateUrl();
}

function toggleTag(name) {
  state.tags.has(name) ? state.tags.delete(name) : state.tags.add(name);
  for (const chip of chips('tags')) chip.classList.toggle('active', state.tags.has(chip.dataset.value));
  state.page = 0;
  apply();
}

searchInput?.addEventListener('input', () => {
  state.query = searchInput.value;
  state.page = 0;
  apply();
});

for (const chip of chips('tags')) {
  chip.addEventListener('click', () => toggleTag(chip.dataset.value));
}
for (const chip of chips('sections')) {
  chip.addEventListener('click', () => {
    state.section = state.section === chip.dataset.value ? null : chip.dataset.value;
    for (const c of chips('sections')) c.classList.toggle('active', c.dataset.value === state.section);
    updateChipScope();
    state.page = 0;
    apply();
  });
}
for (const chip of chips('projects')) {
  chip.addEventListener('click', () => {
    state.project = state.project === chip.dataset.value ? null : chip.dataset.value;
    for (const c of chips('projects')) c.classList.toggle('active', c.dataset.value === state.project);
    state.page = 0;
    apply();
  });
}
// tags in post meta lines toggle the corresponding filter chip
for (const tag of document.querySelectorAll('.meta-tag')) {
  tag.addEventListener('click', () => toggleTag(tag.dataset.value));
}

clearButton?.addEventListener('click', () => {
  state.query = '';
  if (searchInput) searchInput.value = '';
  state.tags.clear();
  state.section = null;
  state.project = null;
  state.page = 0;
  for (const chip of document.querySelectorAll('.filters .chip')) chip.classList.remove('active');
  updateChipScope();
  apply();
});

// restore the filter state carried in the URL (deep links, back-navigation)
function initFromUrl() {
  const params = new URLSearchParams(location.search);
  const knownTags = chipValues('tags');
  for (const t of (params.get('tags') ?? '').split(',')) if (knownTags.has(t)) state.tags.add(t);
  const section = params.get('section');
  if (section && chipValues('sections').has(section)) state.section = section;
  const project = params.get('project');
  if (project && chipValues('projects').has(project)) state.project = project;
  state.query = params.get('q') ?? '';
  if (searchInput) searchInput.value = state.query;
  const page = parseInt(params.get('page') ?? '1', 10);
  if (Number.isFinite(page) && page > 1) state.page = page - 1;
  for (const c of chips('tags')) c.classList.toggle('active', state.tags.has(c.dataset.value));
  for (const c of chips('sections')) c.classList.toggle('active', c.dataset.value === state.section);
  for (const c of chips('projects')) c.classList.toggle('active', c.dataset.value === state.project);
  updateChipScope();
}

document.addEventListener('langchange', () => { state.page = 0; apply(); });
initFromUrl();
apply();
