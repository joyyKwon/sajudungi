// Writes the public website into /dist-site (git-ignored). GitHub Actions runs this and
// publishes the folder to GitHub Pages (.github/workflows/pages.yml).
// Run locally to preview: npx tsx scripts/build-site.ts
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { SiteConfig, renderSite } from './site';

const OUT = 'dist-site';
const config = JSON.parse(readFileSync('scripts/site.config.json', 'utf8')) as SiteConfig;

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
const files = renderSite(config);
for (const [name, content] of Object.entries(files)) writeFileSync(`${OUT}/${name}`, content);
cpSync('scripts/site-assets', OUT, { recursive: true }); // images the pages reference
console.log(`wrote ${OUT}/ (${Object.keys(files).length} files)`);
