// Linki wyprowadzające poza serwis otwierają się w nowej karcie.
// Markdown nie umie nadawać atrybutów linkom, a wpisywanie surowego <a target="_blank">
// w treść wpisu psułoby czytelność źródła — stąd ta obróbka na gotowym drzewie HTML.
//
// rel jest obowiązkowe, nie kosmetyczne: bez noopener strona otwarta w nowej karcie
// dostaje window.opener i może podmienić adres karty, z której wyszła.
//
// Linki wewnętrzne (/wpisy/..., #kotwica) i mailto: zostają w tej samej karcie —
// wyrzucanie czytelnika z serwisu przy każdym kliknięciu byłoby wrogie.
export default function rehypeExternalLinks({ site } = {}) {
  const host = site ? new URL(site).host : null;
  return (tree) => walk(tree, host);
}

function walk(node, host) {
  if (node.type === 'element' && node.tagName === 'a') {
    const { href } = node.properties ?? {};
    if (typeof href === 'string' && isExternal(href, host)) {
      node.properties.target = '_blank';
      node.properties.rel = ['noopener', 'noreferrer'];
    }
  }
  for (const child of node.children ?? []) walk(child, host);
}

function isExternal(href, host) {
  if (!/^https?:\/\//i.test(href)) return false;
  // własna domena podana pełnym adresem to wciąż ten sam serwis
  return !host || new URL(href).host !== host;
}
