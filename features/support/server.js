// Minimal static file server for dist/ — the same thing GitHub Pages does in production.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.json': 'application/json',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.yml': 'text/yaml',
  '.woff2': 'font/woff2',
};

export function serveStatic(root) {
  const absRoot = normalize(root);
  const server = createServer(async (req, res) => {
    try {
      const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      let file = normalize(join(absRoot, pathname));
      if (!file.startsWith(absRoot)) {
        res.writeHead(403);
        return res.end('403');
      }
      let stats = await stat(file).catch(() => null);
      if (stats?.isDirectory()) {
        file = join(file, 'index.html');
        stats = await stat(file).catch(() => null);
      }
      if (!stats) {
        res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
        return res.end('404 Not Found');
      }
      res.writeHead(200, { 'content-type': TYPES[extname(file).toLowerCase()] ?? 'application/octet-stream' });
      res.end(await readFile(file));
    } catch (err) {
      res.writeHead(500);
      res.end(String(err));
    }
  });
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port }));
  });
}
