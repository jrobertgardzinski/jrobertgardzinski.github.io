export const SITE = {
  title: 'jRobertGardzinski',
  // single source of the search-facing copy — titles and meta pull from here;
  // English on purpose: it dominates search per owner's decision
  tagline: "a Java developer's blog",
  description: "A Java developer's blog — hexagonal architecture, DDD, Spring and beyond.",
  url: 'https://jrobertgardzinski.pl',
  author: 'Robert Gardziński',
  email: 'jrobertgardzinski@gmail.com',
  github: 'https://github.com/jrobertgardzinski',
  // adres repo bloga (TODO po jego utworzeniu, np. 'https://github.com/jrobertgardzinski/blog')
  // — puste = brak linków „historia zmian" na wpisach
  repoUrl: '',
  linkedin: 'https://www.linkedin.com/in/robert-gardzi%C5%84ski-26559a188/',
  // shortname strony z disqus.com/admin — puste = komentarze pokazują placeholder
  disqusShortname: '',
  // kod z goatcounter.com (np. 'jrg' dla jrg.goatcounter.com) — puste = brak skryptu analityki
  goatcounterCode: 'jrobertgardzinski',
  postsPerPage: 12,
} as const;

export const SECTIONS = [
  { id: 'it', pl: 'IT', en: 'IT' },
  { id: 'f1', pl: 'F1', en: 'F1' },
  { id: 'diy', pl: 'majsterkowanie', en: 'DIY' },
  { id: 'cooking', pl: 'gotowanie', en: 'cooking' },
] as const;
