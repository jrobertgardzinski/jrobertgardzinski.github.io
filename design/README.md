# Handoff: Blog jRobertGardzinski (generator statyczny)

## Overview
Personal Java developer blog for **jRobertGardzinski** (Robert Gardziński). IntelliJ-inspired aesthetic (Darcula / IntelliJ Light), JetBrains Mono + IBM Plex Sans, compact density. Three screens: post list (home), single post, about page. Bilingual content (PL/EN), client-side filtering, pagination, Disqus comments.

**Target: a static site generator.** Recommended: **Astro** (content collections + Markdown fit this model perfectly; Hugo is an acceptable alternative). One post = one Markdown file with frontmatter; shared layouts produce all HTML. Generate an RSS feed (`rss.xml`) at build time.

## About the Design Files
The `.dc.html` files in this bundle are **design references created in HTML** — working prototypes showing intended look and behavior, NOT production code to copy directly. Recreate them in the generator's templating system. Open them in a browser (with `support.js` alongside) to inspect the live behavior.

## Fidelity
**High-fidelity.** Colors, typography, spacing and interactions are final. Recreate pixel-perfectly.

## Content model (frontmatter per post)
```yaml
title: "Hello World"
date: 2026-07-17
lang: pl          # pl | en — a bilingual post is TWO md files sharing a slug (hello-world.pl.md / hello-world.en.md)
section: it       # it | f1 | diy | cooking
project: blog     # optional; one project per post (blog | hexagon-demo | benchmarki | …)
tags: [hello-world, claude]
readingTime: 3    # or compute at build time
```
Section display labels are localized: it→IT/IT, f1→F1/F1, diy→majsterkowanie/DIY, cooking→gotowanie/cooking (PL/EN).

## Screens / Views

### 1. Strona główna (post list) — `Strona główna.dc.html`
- Max content width 880px, padding 28px 24px 64px, vertical gap 22px.
- **Top nav** (all pages; NOT sticky — scrolls away with content): bg `--panel`, 1px bottom border `--border`, padding 10px 16px, JetBrains Mono 13px, flex-wrap for mobile. Left: logo badge 26×26px (rounded 4px, bg `--panel2`, 1px `--border`) with "jRG" 12px bold — j = `--text-strong`, R = #E05555, G = #4CAF50 — plus name "jRobertGardzinski" 14px bold. Right (margin-left:auto, gap 10-16px): links `wpisy`, `tagi` (scrolls to filters + focuses search on home; links home elsewhere), `o-mnie`; theme toggle button (label "Darcula"/"Light", bg `--panel2`, 1px `--border`, radius 4px, padding 4px 10px); language segmented control PL|EN (active: bg `--sel`, color `--accent-strong`; inactive: bg `--panel2`, color `--muted`).
- **Featured card**: newest post in the current language. bg `--panel`, 1px `--border` + 3px left border `--kw`, radius 6px, padding 18px 22px. Label "najnowszy wpis · {LANG}" (mono 11px uppercase, `--muted`), title clamp(19px,5vw,22px) `--text-strong` linking to the post, excerpt 14px, tag line `--accent-strong` mono 11.5px, date+read time right-aligned `--muted`.
- **Search box**: bg `--panel`, 1px `--border`, radius 6px, padding 8px 12px; "&gt;" prompt in `--muted`; transparent input, mono 13px, placeholder "szukaj wpisów…"; result count right ("{n} wpisów", mono 11.5px `--muted`).
- **Filter rows** (each: label mono 11px `--muted` min-width 66px + wrapping chip row, gap 6px). Order top→bottom: **działy** (sections, accent `--kw`), **projekty** (accent `--field`, chips prefixed `~/`), **tagi** (accent `--accent`, chips prefixed `#`). Chip: bg `--panel`, 1px `--border`, radius 3px, padding 3px 10px, mono 11.5px, color `--muted`; active: bg `--sel`, border+text in the row's accent color.
- **Post list**: rows separated by 1px `--border`, padding 14px 2px. Title 16.5px `--text-strong` (hover `--accent-strong`); language badge (PL / EN / PL/EN) mono 10.5px `--ann` with 1px border radius 3px; excerpt 13.5px; meta line mono 11px `--muted`: date · read time · clickable tags (`--accent-strong`, hover `--fn`) · project `~/name` (`--field`).
- **Empty state**: `// brak wyników — NoSuchPostException` mono 13px `--muted`.
- **Pagination**: 12 per page. Centered under list, mono 12.5px: ← prev, numbered buttons (active: `--sel` bg, `--accent` border, `--accent-strong` text), next →. Hidden when 1 page. Any filter/search/language change resets to page 1.
- **Footer** (all pages): 1px top border, mono 12px `--muted`; left `jrobertgardzinski@gmail.com` as mailto; right `github · linkedin · rss` links.

### 2. Wpis (single post) — `Wpis.dc.html`
- Max width 760px. "← wpisy" back link (mono 12px `--muted`).
- Header: H1 clamp(26px,7vw,34px) `--text-strong`; meta row mono 11.5px `--muted`: date · read time · lang badge (`--ann`) · tag chips.
- Body: 15.5px / 1.7 IBM Plex Sans, `text-wrap: pretty`, gap 16px; H2 21px `--text-strong`; inline `em`/`strong`; mono comment-style asides in `--cmt` (e.g. `// kompiluje się. shipujemy.`).
- **Code blocks**: container bg `--panel`, 1px `--border`, radius 6px; header bar (filename e.g. `HelloWorld.java`) bg `--panel2`, mono 11.5px `--muted`, 1px bottom border; `pre` padding 16px 18px, JetBrains Mono 13.5px / 1.65, horizontal scroll. Syntax colors = the `--kw/--str/--cmt/--num/--fn/--ann/--field` tokens (both themes). Use Shiki/Prism with a custom theme mapped to these tokens.
- **Bilingual post**: PL|EN switch in nav swaps the entire article body (both language versions of "Hello World" are in the prototype — reuse verbatim).
- **Comments**: section headed `// komentarze` (mono 11px uppercase `--muted`); standard Disqus embed (`#disqus_thread`), shortname configurable (site config; user's shortname: `rob`). Unconfigured fallback: dashed-border panel with mono hint text.
- **Prev/next nav**: top-bordered row, mono 12.5px; older/newer post titles as links, `← starszych wpisów brak` when none.

### 3. O mnie (about) — `O mnie.dc.html`
- Max width 880px, gap 28px.
- Header: 96×96px photo slot (replace placeholder with a real photo asset), radius 6px; mono comment `// „j" jak w dobrych bibliotekach: jUnit, jOOQ, jRG` in `--cmt`; H1 clamp(24px,6vw,30px) "Cześć, jestem Robert."; intro paragraph.
- "// czym się zajmuję" grid: auto-fit minmax(190px,1fr), gap 10px; cards bg `--panel`, 1px `--border`, radius 6px, padding 14px 16px; card title mono 13px bold `--kw`, body 13.5px. Four cards: programowanie / f1 / diy / gotowanie (copy in prototype).
- Featured-post teaser card (same style as home featured card) linking to the newest post.

## Interactions & Behavior
- **Theme toggle**: two themes via CSS custom properties on `body[data-theme]`; default dark (Darcula). Persist in `localStorage`.
- **Language switch (PL|EN)**: filters the post list (a post is visible when its lang matches, `PL/EN` visible in both); swaps featured post; on a bilingual post swaps the body. Persist choice.
- **Filters**: tags = multi-select AND; project = single-select toggle; section = single-select toggle; search matches title/excerpt/tags case-insensitively. All combine with AND; all reset pagination.
- Hover states: links `--fn`; chips get accent border; buttons get `--accent` border.
- No animations/transitions beyond browser-default smooth scroll for the "tagi" nav link.

## Design Tokens
Dark (Darcula, default): `--bg #2B2B2B; --panel #3C3F41; --panel2 #313335; --border #4E5254; --text #BBBBBB; --text-strong #E8E8E8; --muted #808080; --accent #6897BB; --accent-strong #89B0D0; --kw #CC7832; --str #6A8759; --cmt #808080; --num #6897BB; --fn #FFC66D; --ann #BBB529; --field #9876AA; --sel rgba(104,151,187,.18)`

Light (IntelliJ Light): `--bg #F7F8FA; --panel #FFFFFF; --panel2 #EDEFF2; --border #D4D7DC; --text #33383D; --text-strong #080808; --muted #8C8C8C; --accent #1B3E7A; --accent-strong #0033B3; --kw #0033B3; --str #067D17; --cmt #8C8C8C; --num #1750EB; --fn #00627A; --ann #9E880D; --field #871094; --sel rgba(0,51,179,.08)`

Logo letters: R #E05555, G #4CAF50 (theme-independent).
Fonts (Google Fonts): JetBrains Mono (400/500/700, + italic 400) for UI chrome, labels, meta, code; IBM Plex Sans (400–700, + italic 400) for body copy. Base 15px/1.55.
Links: default `--accent-strong`, hover `--fn` underlined. Radii: 3px chips, 4px buttons, 6px cards.

## Build requirements
- RSS feed at `/rss.xml` (all posts, both languages).
- Pagination: 12 posts/page.
- Reading time computed at build if not in frontmatter.
- Sitemap + proper `lang` attributes per post for SEO.
- Deploy target: GitHub Pages or Cloudflare Pages (free); custom .pl domain.

## Assets
- No image assets yet; the about-page photo is a striped placeholder — ask the owner for a real photo.
- Fonts loaded from Google Fonts (self-host at build time if preferred).

## Implementation notes for Claude Code (infrastructure & workflow)
Decisions already made with the owner — implement as follows:

1. **Stack**: Astro + content collections. Posts as Markdown in `src/content/posts/` (frontmatter schema above). One post = one `.md`; bilingual post = two files sharing a slug (`hello-world.pl.md`, `hello-world.en.md`).
2. **Hosting**: GitHub Pages, deploy via GitHub Actions on every push to `main` (official `withastro/action`). Custom domain: owner is buying `jrobertgardzinski.pl` — add `CNAME` support and document the DNS setup (CNAME/ALIAS to Pages, or Cloudflare in front).
3. **Writing workflow (online)**: configure **Sveltia CMS** (Decap-compatible) at `/admin` with `admin/config.yml` mapping ALL frontmatter fields as widgets: title (string), date (datetime), lang (select: pl/en), section (select: it/f1/diy/cooking), project (select from list + allow new), tags (list), draft (boolean). Auth via GitHub backend. Publishing from the CMS = commit to `main` = auto-deploy. Fallback that must also work: editing `.md` via github.dev.
4. **Comments**: Disqus embed on post pages; shortname `rob` in site config (single constant, easy to change).
5. **RSS**: `@astrojs/rss` → `/rss.xml`, all posts both languages; wire the footer `rss` link to it.
6. **Seed content**: the "Hello World" post (both language versions, verbatim from `Wpis.dc.html`) as the first two `.md` files. The other posts listed in the prototype are placeholders — do NOT create them.
7. **Client-side behavior** (search, tag/project/section filters, pagination, PL/EN and theme toggles with localStorage persistence) stays in a small vanilla JS island; no framework runtime needed.
8. Migrate the existing style overrides carefully: all styling is inline in the prototypes — extract to CSS with the custom-property theme tokens listed above.

## Files
- `Strona główna.dc.html` — post list (filters, search, pagination, featured)
- `Wpis.dc.html` — single post (bilingual Hello World content, code block, Disqus)
- `O mnie.dc.html` — about page
- `support.js` — prototype runtime; needed only to open the prototypes, irrelevant to the implementation
