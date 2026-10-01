// The public website is rendered from lib/legal.ts (scripts/site.ts), so the web copy of
// the legal documents is always the app's copy. This checks what gets published.
import { existsSync, readFileSync } from 'node:fs';
import { LEGAL_DOCS } from '../lib/legal';
import { SiteConfig, renderSite } from './site';

let pass = 0, fail = 0;
const ok = (label: string, cond: boolean, extra?: unknown) => (cond ? pass++ : (fail++, console.log('FAIL', label, extra ?? '')));

// Only public values may live in the committed config.
const config = JSON.parse(readFileSync('scripts/site.config.json', 'utf8')) as SiteConfig;
ok('config has exactly the two public values', Object.keys(config).sort().join() === 'supabasePublishableKey,supabaseUrl');
ok('config URL is a Supabase project address', /^https:\/\/[a-z0-9]+\.supabase\.co$/.test(config.supabaseUrl), config.supabaseUrl);
ok('config key is a publishable key, never a secret one', config.supabasePublishableKey.startsWith('sb_publishable_'));

const site = renderSite(config);
ok('site files', Object.keys(site).sort().join() === ['.nojekyll', 'config.js', 'delete-account.html', 'index.html', 'notice.html', 'privacy.html', 'terms.html'].join());

// Every legal sentence is on its page, escaped.
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
for (const id of ['terms', 'privacy', 'notice'] as const) {
  const html = site[`${id}.html`];
  for (const section of LEGAL_DOCS[id].sections) {
    ok(`${id}: heading "${section.heading}"`, html.includes(`<h2>${esc(section.heading)}</h2>`));
    for (const line of section.body) ok(`${id}: body line`, html.includes(`<p>${esc(line)}</p>`), line.slice(0, 40));
  }
}
ok('index links to every page', ['terms.html', 'privacy.html', 'notice.html', 'delete-account.html'].every((f) => site['index.html'].includes(`href="${f}"`)));
// A link's label is the title of the page it opens.
for (const id of ['terms', 'privacy', 'notice'] as const) {
  const title = esc(LEGAL_DOCS[id].title);
  ok(`index label = ${id} page title`, site['index.html'].includes(`<a href="${id}.html">${title}</a>`) && site[`${id}.html`].includes(`<h1>${title}</h1>`));
}
ok('index label = deletion page title', site['index.html'].includes('<a href="delete-account.html">계정 삭제 요청</a>') && site['delete-account.html'].includes('<h1>계정 삭제 요청</h1>'));
for (const img of site['index.html'].match(/<img src="([^"]+)"/g) ?? []) {
  const file = img.replace('<img src="', '').replace('"', '');
  ok(`image ${file} is shipped`, existsSync(`scripts/site-assets/${file}`));
}

// Account deletion page: what Google Play asks for, and no secrets.
const del = site['delete-account.html'];
ok('deletion page names what is deleted and the 30-day period', del.includes('삭제되는 정보') && del.includes('30일') && del.includes('사주 목록') && del.includes('학습 진도'));
ok('deletion page offers the in-app path too', del.includes('마이 &gt; 계정 삭제'));
ok('deletion page signs in three ways', ['loginForm', 'kakaoBtn', 'googleBtn'].every((id) => del.includes(`id="${id}"`)));
ok('deletion page writes only deletion_requests', (del.match(/\.from\('([a-z_]+)'\)/g) ?? []).every((m) => m === ".from('deletion_requests')"));
ok('deletion page does not keep a session', del.includes('persistSession: false'));
ok('config.js carries the public values', site['config.js'].includes(JSON.stringify({ url: config.supabaseUrl, key: config.supabasePublishableKey })));
ok('no secret keys anywhere on the site', Object.values(site).every((c) => !/service_role|sb_secret_|eyJhbGciOi/.test(c)));

// The deploy workflow must rebuild whenever anything the site is made from changes.
const workflow = readFileSync('.github/workflows/pages.yml', 'utf8');
for (const path of ['lib/legal.ts', 'scripts/site.ts', 'scripts/build-site.ts', 'scripts/site.config.json', 'scripts/site-assets/**', '.github/workflows/pages.yml']) {
  ok(`workflow watches ${path}`, workflow.includes(`- ${path}`));
}

console.log(`verify-site: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
