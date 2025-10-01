import { readFile } from 'fs/promises';
import path from 'path';

export default async function handler(req, res) {
  try {
    // attempt to read the built index.html from common locations
    const candidates = [
      path.join(process.cwd(), 'frontend', 'index.html'),
      path.join(process.cwd(), 'frontend', 'dist', 'index.html'),
      path.join(process.cwd(), 'dist', 'index.html'),
    ];

    let html = null;
    for (const p of candidates) {
      try {
        html = await readFile(p, 'utf8');
        break;
      } catch (e) {
        // ignore and try next
      }
    }

    if (!html) {
      return res.status(500).send('index.html not found on the server');
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(html);
  } catch (err) {
    console.error('Error serving index.html:', err);
    res.status(500).send('Internal Server Error');
  }
}
