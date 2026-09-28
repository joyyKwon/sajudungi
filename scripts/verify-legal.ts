// Checks the legal documents and that the app still behaves the way they say.
// Run: npx --yes tsx scripts/verify-legal.ts            (structure + claims)
//      npx --yes tsx scripts/verify-legal.ts --release  (also fails on unfilled placeholders)
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { LEGAL_DOCS, LEGAL_VERSION, PLACEHOLDER_PATTERN } from '../lib/legal';

let pass = 0, fail = 0;
const ok = (label: string, cond: boolean, extra?: unknown) => (cond ? pass++ : (fail++, console.log('FAIL', label, extra ?? '')));

const release = process.argv.includes('--release');
const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    if (['node_modules', '.expo', '.git', 'mockups', 'scripts', 'supabase'].includes(f)) return [];
    return statSync(p).isDirectory() ? walk(p) : /\.(ts|tsx)$/.test(f) ? [p] : [];
  });
const files = walk('.').map((path) => ({ path, src: readFileSync(path, 'utf8') }));
const all = files.map((f) => f.src).join('\n');

// Structure
ok('version set', LEGAL_VERSION.length > 0);
for (const id of ['terms', 'privacy', 'notice'] as const) {
  const doc = LEGAL_DOCS[id];
  ok(`${id} exists`, !!doc && doc.id === id && doc.title.length > 0 && doc.sections.length >= 4);
  const text = [doc.intro ?? '', ...doc.sections.flatMap((s) => [s.heading, ...s.body])].join('\n');
  ok(`${id} text clean`, !/undefined|NaN|\[object|null/.test(text));
  ok(`${id} sections non-empty`, doc.sections.every((s) => s.heading.trim() && s.body.length > 0 && s.body.every((l) => l.trim().length > 0)));
}
ok(
  'privacy covers required topics',
  [
    '항목', '보유', '파기', '제3자', '권리', '책임자', '만 14세', '권익침해 구제', '118', '개정 이력', '다른 사람의 정보', '메모', '사주 목록',
    '로그인', '카카오', '비밀번호', '처리 위탁', '국외 이전', 'Supabase', '미국', '30일', '계정 삭제', '유예',
  ].every((k) => JSON.stringify(LEGAL_DOCS.privacy).includes(k)),
);
ok(
  'terms cover required topics',
  ['목적', '약관의 효력', '책임의 제한', '준거법', '만 14세', '개정 이력', '다른 사람의 정보', '동의를 받아야', '회원가입', '계정', '비밀번호', '30일'].every((k) =>
    JSON.stringify(LEGAL_DOCS.terms).includes(k),
  ),
);

// Privacy sections are numbered 1..N without gaps
const nums = LEGAL_DOCS.privacy.sections.map((s) => parseInt(s.heading, 10));
ok('privacy sections numbered in order', nums.every((n, i) => n === i + 1), nums);

// Claims in the privacy policy vs. the code
// Files allowed to talk to Supabase at all: the client itself, the content loader (읽기 전용,
// see below), and the two files that implement login/sync (§1-4 of the privacy policy).
const SUPABASE_FILES = ['lib/contentRemote.ts', 'lib/sync.ts', 'lib/syncMerge.ts', 'context/AuthContext.tsx'];
const supabaseUses = files.filter((f) => f.src.includes('supabase') && !f.path.endsWith('lib/supabase.ts'));
ok(
  'supabase is only used by the content loader and the login/sync files named in the privacy policy',
  supabaseUses.every((f) => SUPABASE_FILES.some((allowed) => f.path.endsWith(allowed))),
  supabaseUses.map((f) => f.path),
);
// content_blocks (문구, read-only) and the three tables §4 discloses for logged-in users.
const PRIVACY_TABLES = ['content_blocks', 'people', 'progress', 'deletion_requests'];
ok('only the tables named in the privacy policy are queried', [...all.matchAll(/\.from\(['"]([^'"]+)['"]\)/g)].every((m) => PRIVACY_TABLES.includes(m[1])));
ok('the content loader stays read-only', !/supabase\.auth|\.insert\(|\.upsert\(|\.update\(|\.delete\(|\.rpc\(/.test(files.filter((f) => f.path.endsWith('contentRemote.ts')).map((f) => f.src).join('')));
ok(
  'no auth/write calls outside the login/sync files',
  files
    .filter((f) => !f.path.endsWith('lib/sync.ts') && !f.path.endsWith('context/AuthContext.tsx'))
    .every((f) => !/supabase\.auth|\.from\(['"](?:people|progress|deletion_requests)['"]\)/.test(f.src)),
);
ok('no analytics / crash / ads packages', !/sentry|firebase|amplitude|mixpanel|admob|expo-tracking|app-tracking|posthog|segment/i.test(readFileSync('package.json', 'utf8')));

// "내 정보 삭제" removes everything the app stores about the user (not the public content cache)
const storage = readFileSync('lib/storage.ts', 'utf8');
const keys = [...storage.matchAll(/^\s+(\w+): 'sajudungi\.[^']+',/gm)].map((m) => m[1]);
const removers = files.filter((f) => /removeKeys\(/.test(f.src) && !f.path.endsWith('lib/storage.ts')).map((f) => f.src).join('\n');
for (const key of keys.filter((k) => k !== 'content')) ok(`delete covers ${key}`, removers.includes(`STORAGE_KEYS.${key}`));
ok('content cache is not personal data', keys.includes('content'));

// Placeholders
const lines = Object.values(LEGAL_DOCS).flatMap((d) => [d.intro ?? '', ...d.sections.flatMap((s) => [s.heading, ...s.body])]);
const placeholders = [...new Set(lines.flatMap((l) => l.match(PLACEHOLDER_PATTERN) ?? []))];
if (placeholders.length > 0) console.log(`${release ? 'FAIL' : 'NOTE'} unfilled placeholders (lib/legal.ts LEGAL_CONFIG):`, placeholders.join(', '));
if (release) ok('no placeholders left', placeholders.length === 0);

console.log(`verify-legal: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
