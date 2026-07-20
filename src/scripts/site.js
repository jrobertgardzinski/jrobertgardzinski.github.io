// Shared chrome behavior: theme toggle + language switch, both persisted in localStorage.
const THEME_KEY = 'theme';
const LANG_KEY = 'lang';
const html = document.documentElement;

export const getLang = () => localStorage.getItem(LANG_KEY) || 'pl';

const themeToggle = document.getElementById('theme-toggle');
const langButtons = { pl: document.getElementById('lang-pl'), en: document.getElementById('lang-en') };

function updateThemeButton() {
  if (themeToggle) themeToggle.textContent = html.dataset.theme === 'light' ? 'Light' : 'Darcula';
}

// the tab icon mirrors the site theme, matching the logo; both icon links
// (svg + png) are swapped — browsers differ in which one they pick — and
// re-appended to <head>, which forces an immediate icon repaint
const iconLinks = [...document.querySelectorAll('link[rel="icon"]')];
function updateFavicon() {
  const suffix = html.dataset.theme === 'light' ? '-light' : '';
  for (const link of iconLinks) {
    const ext = link.type === 'image/png' ? 'png' : 'svg';
    link.href = `/favicon${suffix}.${ext}?v=8`;
    document.head.appendChild(link);
  }
}

function updateLangButtons() {
  const lang = getLang();
  for (const [l, btn] of Object.entries(langButtons)) {
    if (btn) btn.classList.toggle('active', l === lang);
  }
}

// nav labels are bilingual (wpisy/posts, o-mnie/about-me)
function updateNavLabels() {
  const lang = getLang();
  for (const link of document.querySelectorAll('.nav-link[data-label-pl]')) {
    link.textContent = lang === 'pl' ? link.dataset.labelPl : link.dataset.labelEn;
  }
}

// On a monolingual post page, choosing the missing language shows a notice
// instead of navigating away (the preference is still saved for the list).
function updateTranslationNotices() {
  const lang = getLang();
  for (const l of ['pl', 'en']) {
    const notice = document.getElementById(`no-${l}-notice`);
    if (notice) notice.hidden = lang !== l;
  }
}

themeToggle?.addEventListener('click', () => {
  html.dataset.theme = html.dataset.theme === 'light' ? 'dark' : 'light';
  localStorage.setItem(THEME_KEY, html.dataset.theme);
  updateThemeButton();
  updateFavicon();
});

for (const [lang, btn] of Object.entries(langButtons)) {
  btn?.addEventListener('click', () => {
    localStorage.setItem(LANG_KEY, lang);
    updateLangButtons();
    updateNavLabels();
    updateTranslationNotices();
    document.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
    // on a bilingual post page the switch navigates to the other language variant
    const target = document.body.dataset['counterpart' + (lang === 'pl' ? 'Pl' : 'En')];
    if (target && target !== location.pathname) location.href = target;
  });
}

// "← wpisy" on a post behaves like the browser back button when the reader
// came from the list — that restores their filters (kept in the list URL);
// direct visitors get a plain navigation to a clean list
const backLink = document.querySelector('.back-link a');
backLink?.addEventListener('click', (e) => {
  try {
    const ref = new URL(document.referrer);
    if (ref.origin === location.origin && ref.pathname === '/') {
      e.preventDefault();
      history.back();
    }
  } catch {
    // no/invalid referrer — normal navigation
  }
});

// mobile: hamburger toggles the collapsed menu
const navToggle = document.getElementById('nav-toggle');
navToggle?.addEventListener('click', () => {
  const open = navToggle.closest('.top-nav').classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(open));
});

updateThemeButton();
updateFavicon();
updateLangButtons();
updateNavLabels();
updateTranslationNotices();
