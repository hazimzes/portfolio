// Rewrites absolute dev-server URLs in the static mirror to the GitHub Pages
// base path. Handles both plain and JSON-escaped (`\/`) URL variants.
// Usage: node scripts/rewrite-base-url.js <dir> <host> <basePath>
const fs = require("fs");
const path = require("path");

const [, , dir, host, basePath] = process.argv;
if (!dir || !host || !basePath) {
  console.error("usage: node scripts/rewrite-base-url.js <dir> <host> <basePath>");
  process.exit(1);
}

const escapedHost = host.replace(/\//g, "\\/");
const escapedBase = basePath.replace(/\//g, "\\/");

function walk(current) {
  for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
    const full = path.join(current, entry.name);
    if (entry.isDirectory()) {
      walk(full);
      continue;
    }
    if (!/\.(html|css|js|json|txt|xml)$/.test(entry.name)) continue;
    const source = fs.readFileSync(full, "utf8");
    const rewritten = source.split(host).join(basePath).split(escapedHost).join(escapedBase);
    if (rewritten !== source) fs.writeFileSync(full, rewritten);
  }
}

walk(dir);
