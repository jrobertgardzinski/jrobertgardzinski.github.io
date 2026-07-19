// ```java title="HelloWorld.java"  →  a .code-title header bar above the code block
const escapeHtml = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export default function remarkCodeTitle() {
  return (tree) => walk(tree);
}

function walk(node) {
  if (!node.children) return;
  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i];
    if (child.type === 'code') {
      const match = /title="([^"]+)"/.exec(child.meta ?? '');
      if (match) {
        node.children.splice(i, 0, {
          type: 'html',
          value: `<div class="code-title">${escapeHtml(match[1])}</div>`,
        });
        i++;
      }
    } else {
      walk(child);
    }
  }
}
