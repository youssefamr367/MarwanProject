import { readdir, stat } from "fs/promises";
import path from "path";

async function walk(dir, depth = 0, maxDepth = 3) {
  if (depth > maxDepth) return [];
  let entries = [];
  try {
    const names = await readdir(dir);
    for (const name of names) {
      const full = path.join(dir, name);
      try {
        const s = await stat(full);
        if (s.isDirectory()) {
          entries.push({
            name,
            path: full,
            type: "dir",
            children: await walk(full, depth + 1, maxDepth),
          });
        } else {
          entries.push({ name, path: full, type: "file", size: s.size });
        }
      } catch (e) {
        entries.push({ name, path: full, error: String(e) });
      }
    }
  } catch (e) {
    return [{ error: `read error ${dir}: ${String(e)}` }];
  }
  return entries;
}

export default async function handler(req, res) {
  try {
    const root = process.cwd();
    const tree = await walk(root, 0, 2);
    // Also check common frontend build paths explicitly
    const checks = [];
    const candidates = [
      path.join(root, "frontend", "index.html"),
      path.join(root, "frontend", "dist", "index.html"),
      path.join(root, "dist", "index.html"),
    ];
    for (const c of candidates) {
      try {
        const s = await stat(c);
        checks.push({ path: c, exists: true, size: s.size });
      } catch (e) {
        checks.push({ path: c, exists: false });
      }
    }

    res.status(200).json({ cwd: root, tree, checks });
  } catch (err) {
    console.error("list-files error", err);
    res.status(500).json({ error: String(err) });
  }
}
