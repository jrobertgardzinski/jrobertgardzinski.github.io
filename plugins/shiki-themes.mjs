// IntelliJ-flavoured Shiki themes built from the design tokens in global.css.
// IntelliJ semantics: method *declarations* get the function color, method
// *calls* stay in the plain text color — hence the meta.*-call overrides.
const settings = (c) => [
  { settings: { foreground: c.text } },
  { scope: ['comment', 'punctuation.definition.comment'], settings: { foreground: c.cmt } },
  { scope: ['string', 'punctuation.definition.string'], settings: { foreground: c.str } },
  { scope: ['constant.numeric'], settings: { foreground: c.num } },
  {
    scope: ['keyword', 'storage.type', 'storage.modifier', 'constant.language', 'variable.language'],
    settings: { foreground: c.kw },
  },
  { scope: ['entity.name.function'], settings: { foreground: c.fn } },
  {
    scope: [
      'meta.method-call entity.name.function',
      'meta.function-call entity.name.function',
      'meta.function-call support.function',
    ],
    settings: { foreground: c.text },
  },
  {
    scope: ['storage.type.annotation', 'punctuation.definition.annotation', 'meta.declaration.annotation'],
    settings: { foreground: c.ann },
  },
];

export const darcula = {
  name: 'jrg-darcula',
  type: 'dark',
  settings: settings({
    text: '#BBBBBB', cmt: '#808080', str: '#6A8759', num: '#6897BB',
    kw: '#CC7832', fn: '#FFC66D', ann: '#BBB529',
  }),
};

export const intellijLight = {
  name: 'jrg-intellij-light',
  type: 'light',
  settings: settings({
    text: '#33383D', cmt: '#8C8C8C', str: '#067D17', num: '#1750EB',
    kw: '#0033B3', fn: '#00627A', ann: '#9E880D',
  }),
};
